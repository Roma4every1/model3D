import { useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'shared/lib';
import { LoadingStatus, TextInfo } from 'shared/ui';
import { channelSelector } from 'entities/channels';
import { traceStateSelector, wellStateSelector, setCurrentTrace } from 'entities/objects';
import { updateParam, currentPlastCodeSelector} from 'entities/parameters';
import { tableRowToString } from 'entities/parameters/lib/table-row';
import { mapsStateSelector, mapStateSelector } from '../store/map.selectors';
import { fetchMapData, showMapPropertyWindow } from '../store/map.thunks';
import { setMapField, setMapCanvas, applyTraceToMap } from '../store/map.actions';
import { handleClick } from '../lib/traces-map-utils';
import { clientPoint, getFullViewport, getPointToMap } from '../lib/map-utils';
import { MapMode } from '../lib/constants.ts';


export const Map = ({id, parent, channels, data}: FormState & {data?: MapData}) => {
  const dispatch = useDispatch();
  const { model: currentWell } = useSelector(wellStateSelector);
  const { model: currentTrace, editing: traceEditing } = useSelector(traceStateSelector);

  const mapsState = useSelector(mapsStateSelector);
  const mapState: MapState = useSelector(mapStateSelector.bind(id));

  const canvasRef = useRef(null);
  const [isMapExist, setIsMapExist] = useState(true);

  const canvas = mapState?.canvas;
  const stage = mapState?.stage;
  const mapData = stage?.getMapData();
  const loading = mapState?.loading;

  const isPartOfDynamicMultiMap = data !== undefined;
  const activeChannelName = isPartOfDynamicMultiMap ? null : channels[0].name;
  const activeChannel: Channel = useSelector(channelSelector.bind(activeChannelName));
  const currentPlastCode = useSelector(currentPlastCodeSelector);

  useEffect(() => {
    if (!mapState || !isPartOfDynamicMultiMap) return;
    if (!mapState.mapID && data.layers) mapState.stage.setData(data);
  }, [isPartOfDynamicMultiMap, mapState, id, data, dispatch]);

  // проверка параметров формы
  useEffect(() => {
    if (!mapState || isPartOfDynamicMultiMap) return;
    const rows = activeChannel?.data?.rows;
    if (!rows || rows.length === 0) {
      if (loading.percentage < 0) return;
      return setIsMapExist(false);
    }

    setIsMapExist(true);

    const mapInfo = rows[0];
    const owner = mapInfo.Cells[12];
    const mapID = String(mapInfo.Cells[0]);

    const changeOwner = owner !== mapState.owner;
    const changeMapID = mapID !== mapState.mapID;
    const objectName = activeChannel.info.currentRowObjectName;

    if (objectName && (changeOwner || changeMapID)) {
      const value = tableRowToString(activeChannel, mapInfo)
      dispatch(updateParam(parent, objectName, value));
    }
    if (changeOwner) {
      dispatch(setMapField(id, 'owner', owner));
    }
    if (changeMapID) {
      dispatch(setMapField(id, 'mapID', mapID));
      dispatch(fetchMapData(id));
    }
  }, [mapState, activeChannel, id, parent, isPartOfDynamicMultiMap, dispatch]); // eslint-disable-line

  const getWellViewport = useCallback((wellID, maxScale) => {
    if (!mapData) return;
    let pointsData: MapPoint[];
    if (isPartOfDynamicMultiMap) {
      const currentMapID = parent + ',' + mapsState.multi[parent].configs
        .find(c => c.data.plastCode === currentPlastCode)?.id;
      const activeMapState : MapState = mapsState.single[currentMapID];
      if (!activeMapState?.stage.getMapData()) return;
      const isSync = mapsState.multi[parent].sync;
      const isActiveMap = currentMapID === id;

      if (isActiveMap) pointsData = mapData.points;
      if (isSync && !isActiveMap) pointsData = activeMapState.stage.getMapData().points;
      if (!isSync && !isActiveMap) return null;
    } else {
      pointsData = mapData.points;
    }

    const point = pointsData.find(p => parseInt(p.UWID) === wellID);
    if (point) {
      const scale = mapData.scale < maxScale ? mapData.scale : maxScale;
      return {centerX: point.x, centerY: point.y, scale};
    }
    return null;
  }, [
    mapData, currentPlastCode, id, parent, isPartOfDynamicMultiMap,
    mapsState.multi, mapsState.single
  ]);

  const wellsMaxScale = useMemo(() => {
    return mapData?.layers?.find(l => l.elementType === 'sign')?.getMaxScale() ?? 50_000;
  }, [mapData?.layers]);

  // обновление ссылки на холст
  useLayoutEffect(() => {
    if (canvasRef.current === canvas) return;
    dispatch(setMapCanvas(id, canvasRef.current));
    if (!mapData) return;

    const viewport =
      getWellViewport(currentWell?.id, wellsMaxScale) ||
      getFullViewport(mapData.layers, canvasRef.current);

    // случай, когда вкладка карт не была открыта и приосходит редактирование трассы
    if (!mapData.onDrawEnd) mapData.onDrawEnd = ({x, y}, scale) => {
      stage.pointToMap = getPointToMap(canvas, x, y, scale);
    };
    stage.render(viewport);
  });

  /* --- --- */

  const currentWellID = currentWell?.id;
  const wellRef = useRef<WellID>();
  const traceRef = useRef<{id: TraceID, editing: boolean}>();

  // подстраивание карты под выбранную скважину
  useEffect(() => {
    if (currentWellID && currentWellID !== wellRef.current) {
      const viewport = getWellViewport(currentWellID, wellsMaxScale);
      if (viewport) canvasRef.current?.events.emit('cs', viewport);
    }
    wellRef.current = currentWellID;
  }, [currentWellID, getWellViewport, wellsMaxScale, stage]);

  // отрисовка текущей трассы
  useEffect( () => {
    if (!loading || loading.percentage < 100) return;
    const updateViewport =
      currentTrace?.id !== traceRef.current?.id ||           // изменилась активная трасса
      (traceEditing && traceRef.current?.editing === false); // вошли в режим режактирования
    dispatch(applyTraceToMap(id, currentTrace, updateViewport));
    traceRef.current = {id: currentTrace?.id, editing: traceEditing};
  }, [loading, currentTrace, traceEditing, id, dispatch]);

  /* --- --- */

  if (!mapState) return <div/>;
  if (!isMapExist) return <TextInfo text={'map.not-found'}/>;
  if (loading.percentage < 0) return <TextInfo text={'map.not-loaded'}/>;
  if (loading.percentage < 100) return <LoadingStatus {...loading}/>;

  const onMouseDown = ({nativeEvent}) => {
    stage.handleMouseDown(nativeEvent);
    if (!currentTrace || !traceEditing) return;

    // добавление/удаление точек к текущей трассе через клик по карте
    const point = stage.pointToMap(clientPoint(nativeEvent));
    const changed = handleClick(currentTrace, point, mapData);
    if (changed) dispatch(setCurrentTrace({...currentTrace}));
  };

  const onMouseUp = ({nativeEvent}) => {
    const element = stage.handleMouseUp(nativeEvent);
    if (!element) return;

    stage.startCreating();
    if (element.type === 'sign' || element.type === 'label') {
      dispatch(showMapPropertyWindow(id, element));
    }
  };

  const onMouseMove = ({nativeEvent}) => {
    stage.handleMouseMove(nativeEvent);
  };
  const onMouseWheel = ({nativeEvent}) => {
    stage.handleMouseWheel(nativeEvent);
  };

  return (
    <div className={'map-container'}>
      <canvas
        ref={canvasRef}
        style={{cursor: stage.getMode() === MapMode.AWAIT_POINT ? 'crosshair' : 'auto'}}
        onMouseDown={onMouseDown} onMouseUp={onMouseUp}
        onMouseMove={onMouseMove} onWheel={onMouseWheel}
      />
    </div>
  );
};
