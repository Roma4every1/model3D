import { MouseEvent, WheelEvent, useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'shared/lib';
import { LoadingStatus, TextInfo } from 'shared/ui';
import { channelSelector } from 'entities/channels';
import { traceStateSelector, wellStateSelector, setCurrentTrace } from 'entities/objects';
import { updateParam } from 'entities/parameters';
import { tableRowToString } from 'entities/parameters/lib/table-row';
import { mapStateSelector } from '../store/map.selectors';
import { fetchMapData, showMapPropertyWindow } from '../store/map.thunks';
import { setMapField, setMapCanvas, applyTraceToMap } from '../store/map.actions';
import { getFullTraceViewport, getTraceMapElement, handleClick } from '../lib/traces-map-utils';
import { getFullViewport } from '../lib/map-utils';
import { MapMode } from '../lib/constants.ts';


export const Map = ({id, parent, channels}: FormState) => {
  const dispatch = useDispatch();
  const { model: currentWell } = useSelector(wellStateSelector);
  const { model: currentTrace, editing: traceEditing } = useSelector(traceStateSelector);

  const [isMapExist, setIsMapExist] = useState(true);
  const mapState: MapState = useSelector(mapStateSelector.bind(id));

  const canvasRef = useRef(null);
  const { canvas, stage, loading } = mapState;
  const mapData = stage.getMapData();

  const isPartOfDynamicMultiMap = channels === null;
  const activeChannelName = isPartOfDynamicMultiMap ? null : channels[0].name;
  const activeChannel: Channel = useSelector(channelSelector.bind(activeChannelName));

  // проверка параметров формы
  useEffect(() => {
    if (isPartOfDynamicMultiMap) return;
    const rows = activeChannel?.data?.rows;
    if (!rows || rows.length === 0) {
      if (loading.percentage < 0) return;
      return setIsMapExist(false);
    }

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
    setIsMapExist(true);
  }, [mapState, activeChannel, id, parent, isPartOfDynamicMultiMap, dispatch]); // eslint-disable-line

  const getWellViewport = useCallback((wellID: WellID, maxScale: MapScale) => {
    if (wellID === null || wellID === undefined) return null;
    const idString = wellID.toString();
    const point = mapData.points.find(p => p.UWID === idString);

    if (point) {
      const scale = mapData.scale < maxScale ? mapData.scale : maxScale;
      return {centerX: point.x, centerY: point.y, scale};
    }
    return null;
  }, [mapData]);

  const wellsMaxScale = useMemo(() => {
    return mapData?.layers?.find(l => l.elementType === 'sign')?.getMaxScale() ?? 50_000;
  }, [mapData?.layers]);

  // обновление ссылки на холст
  useLayoutEffect(() => {
    if (!mapData || canvasRef.current === canvas) return;
    dispatch(setMapCanvas(id, canvasRef.current));
    if (!canvasRef.current) return;

    let initialViewport: MapViewport;
    if (currentTrace) {
      initialViewport = getFullTraceViewport(getTraceMapElement(currentTrace), canvasRef.current);
    } else if (currentWell) {
      initialViewport = getWellViewport(currentWell.id, wellsMaxScale);
    }
    if (!initialViewport) {
      initialViewport = getFullViewport(mapData.layers, canvasRef.current);
    }
    stage.render(initialViewport);
  });

  /* --- --- */

  const currentWellID = currentWell?.id;
  const wellRef = useRef<WellID>();
  const traceRef = useRef<{id: TraceID, editing: boolean}>();

  // подстраивание карты под выбранную скважину
  useEffect(() => {
    if (!mapData) return;
    if (currentWellID && currentWellID !== wellRef.current) {
      const viewport = getWellViewport(currentWellID, wellsMaxScale);
      if (viewport) canvasRef.current?.events?.emit('sync', viewport);
    }
    wellRef.current = currentWellID;
  }, [currentWellID, getWellViewport, wellsMaxScale, mapData, stage]);

  // отрисовка текущей трассы
  useEffect( () => {
    if (!mapData || loading.percentage < 100) return;
    const updateViewport =
      currentTrace?.id !== traceRef.current?.id ||           // изменилась активная трасса
      (traceEditing && traceRef.current?.editing === false); // вошли в режим режактирования
    dispatch(applyTraceToMap(id, currentTrace, updateViewport));
    traceRef.current = {id: currentTrace?.id, editing: traceEditing};
  }, [loading, currentTrace, traceEditing, mapData, id, dispatch]);

  /* --- --- */

  if (!isMapExist) return <TextInfo text={'map.not-found'}/>;
  if (loading.percentage < 0) return <TextInfo text={'map.not-loaded'}/>;
  if (loading.percentage < 100) return <LoadingStatus {...loading}/>;

  const onMouseDown = ({nativeEvent}: MouseEvent) => {
    if (nativeEvent.button !== 0) return;
    stage.handleMouseDown(nativeEvent);
    if (!currentTrace || !traceEditing) return;

    // добавление/удаление точек к текущей трассе через клик по карте
    const point = stage.eventToPoint(nativeEvent);
    const changed = handleClick(currentTrace, point, mapData);
    if (changed) dispatch(setCurrentTrace({...currentTrace}));
  };

  const onMouseUp = ({nativeEvent}: MouseEvent) => {
    const element = stage.handleMouseUp(nativeEvent);
    if (!element) return;
    element.edited = true;

    if (element.type === 'sign' || element.type === 'label') {
      dispatch(showMapPropertyWindow(id, element));
    } else if (element.type === 'polyline') {
      stage.setMode(MapMode.ADD_END);
    }
  };

  const onMouseMove = ({nativeEvent}: MouseEvent) => {
    stage.handleMouseMove(nativeEvent);
  };
  const onMouseWheel = ({nativeEvent}: WheelEvent) => {
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
