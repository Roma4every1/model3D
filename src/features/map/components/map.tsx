import { MouseEvent, WheelEvent, useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { compareObjects, useDispatch, useSelector } from 'shared/lib';
import { LoadingStatus, TextInfo } from 'shared/ui';
import { channelDictSelector, channelSelector } from 'entities/channels';
import { traceStateSelector, wellStateSelector, setCurrentTrace, setCurrentWell } from 'entities/objects';
import { updateParamDeep } from 'entities/parameters';
import { tableRowToString } from 'entities/parameters/lib/table-row';
import { getMapPresentationParameterSelector, mapStateSelector } from '../store/map.selectors';
import { fetchMapData, showMapPropertyWindow } from '../store/map.thunks';
import { setMapField, setMapCanvas, applyTraceToMap } from '../store/map.actions';
import { getFullTraceViewport, getTraceMapElement, handleTraceClick } from '../lib/traces-map-utils';
import { getFullViewport, PIXEL_PER_METER } from '../lib/map-utils';
import { checkDistancePoints } from '../lib/selecting-utils.ts';
import { MapMode } from '../lib/constants.ts';
import { InclinometryModePlugin } from '../lib/map-plugins/plugins/InclinometryModePlugin/InclinometryModePlugin.ts';
import {InclModePluginParamNames, PluginNames} from '../lib/map-plugins/lib/constants.ts';


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

  const angleParamName = InclModePluginParamNames.VIEW_ANGLE;
  const angleSelector = getMapPresentationParameterSelector(parent, angleParamName)
  const angleParam = useSelector(angleSelector);

  const inclPlugin = stage.plugins.find(it =>
    it.name === PluginNames.INCLINOMETRY_MODE
  ) as InclinometryModePlugin;

  // проверка параметров формы
  useEffect(() => {
    if (isPartOfDynamicMultiMap) return;
    const rows = activeChannel?.data?.rows;
    if (!rows || rows.length === 0) {
      if (stage.inclinometryModeOn && !canvas) {
        stage.setData({
          layers: [],
          x: 0,
          y: 0,
          scale: 1
        } as MapData);
        dispatch(setMapCanvas(id, canvasRef.current));
        inclPlugin.setUpdateAngleParamFunction((value: number) =>
          dispatch(updateParamDeep(parent, angleParamName, value))
        );
        setIsMapExist(true);
        return;
      }
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
      dispatch(updateParamDeep(parent, objectName, value));
    }
    if (changeOwner) {
      dispatch(setMapField(id, 'owner', owner));
    }
    if (changeMapID) {
      dispatch(setMapField(id, 'mapID', mapID));
      dispatch(fetchMapData(id));
    }
    setIsMapExist(true);
  }, [mapState, activeChannel, id, parent, isPartOfDynamicMultiMap, stage.inclinometryModeOn, dispatch]); // eslint-disable-line

  const getWellViewport = useCallback((wellID: WellID, maxScale: MapScale) => {
    if (wellID === null || wellID === undefined) return null;
    const idString = wellID.toString();
    const point = mapData.points.find(p => p.UWID === idString);

    if (point) {
      const scale = mapData.scale < maxScale ? mapData.scale : maxScale;
      if (stage.inclinometryModeOn) {
        const centerX = point.x - inclPlugin?.mapShiftX * scale / window.devicePixelRatio / PIXEL_PER_METER;
        const centerY = point.y - inclPlugin?.mapShiftY * scale / window.devicePixelRatio / PIXEL_PER_METER;
        return {centerX, centerY, scale};
      }
      return {centerX: point.x, centerY: point.y, scale};
    }
    return null;
  }, [inclPlugin.mapShiftX, inclPlugin.mapShiftY,
    mapData?.points, mapData?.scale, stage.inclinometryModeOn]);

  const wellsMaxScale = useMemo(() => {
    if (stage.inclinometryModeOn) return 5_000;
    return mapData?.layers?.find(l => l.elementType === 'sign')?.getMaxScale() ?? 50_000;
  }, [mapData?.layers, stage.inclinometryModeOn]);

  // обновление ссылки на холст
  useLayoutEffect(() => {
    if (!mapData || canvasRef.current === canvas) return;
    dispatch(setMapCanvas(id, canvasRef.current));
    if (!canvasRef.current) return;

    let initialViewport: MapViewport;
    if (stage.inclinometryModeOn) {
      initialViewport = getWellViewport(currentWell.id, wellsMaxScale);
    } else if (currentTrace) {
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
  const traceRef = useRef<TraceID>();

  // подстраивание карты под выбранную скважину
  useEffect(() => {
    if (!mapData?.points) return;
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
      currentTrace?.id !== traceRef.current || // изменилась активная трасса
      (traceEditing && !stage.traceEditing);   // вошли в режим режактирования
    dispatch(applyTraceToMap(id, currentTrace, updateViewport));
    stage.traceEditing = traceEditing;
    traceRef.current = currentTrace?.id;
  }, [loading, currentTrace, traceEditing, mapData, stage, id, dispatch]);

  /* --- --- */

  const channelNames = channels.map(c => c.name);
  const channelDict: ChannelDict = useSelector(channelDictSelector.bind(channelNames), compareObjects);

  // обновление каналов плагинов
  useEffect(() => {
    stage.plugins.forEach(p => {
      p.setData(channelDict, angleParam);
    });
    setIsMapExist(true);
    stage.render();
  }, [mapData?.layers, channelDict, stage, angleParam]);

  /* --- --- */

  if (!isMapExist) return <TextInfo text={'map.not-found'}/>;
  if (loading.percentage < 0) return <TextInfo text={'map.not-loaded'}/>;
  if (loading.percentage < 100) return <LoadingStatus {...loading}/>;

  const onMouseDown = ({nativeEvent}: MouseEvent) => {
    if (stage.inclinometryModeOn) return;
    if (nativeEvent.button !== 0) return;
    stage.handleMouseDown(nativeEvent);
    if (mapData.scale > wellsMaxScale) return;
    const { x: clickX, y: clickY } = mapData;

    const needHandleTrace = currentTrace && traceEditing;
    const needHandleWell = !needHandleTrace &&
      !stage.getSelecting() && !stage.isElementEditing() && !stage.isElementCreating();
    if (!needHandleWell && !needHandleTrace) return;

    setTimeout(() => {
      // если сразу после клика есть движение, то ничего делать не надо
      if (mapData.x !== clickX || mapData.y !== clickY) return;

      const point = stage.eventToPoint(nativeEvent);
      const mapPoint = mapData.points.find(p => checkDistancePoints(point, p, mapData.scale));
      if (!mapPoint) return;

      if (needHandleTrace) {
        handleTraceClick(currentTrace, mapPoint);
        dispatch(setCurrentTrace({...currentTrace}));
      } else {
        dispatch(setCurrentWell(parseInt(mapPoint.UWID)));
      }
    }, 50);
  };

  const onMouseUp = ({nativeEvent}: MouseEvent) => {
    const element = stage.handleMouseUp(nativeEvent);
    if (stage.inclinometryModeOn) return;
    if (!element) return;
    element.edited = true;

    if (element.type === 'polyline') {
      stage.setMode(MapMode.ADD_END);
    } else {
      stage.setMode(MapMode.MOVE_MAP);
      dispatch(showMapPropertyWindow(id, element));
    }
  };

  const onMouseMove = ({nativeEvent}: MouseEvent) => {
    stage.handleMouseMove(nativeEvent);
  };
  const onMouseWheel = ({nativeEvent}: WheelEvent) => {
    stage.handleMouseWheel(nativeEvent);
  };
  const onMouseLeave = () => {
    stage.scroller.mouseUp();
  };

  return (
    <div className={'map-container'}>
      <canvas
        ref={canvasRef}
        style={{cursor: stage.getMode() === MapMode.AWAIT_POINT ? 'crosshair' : 'auto'}}
        onMouseDown={onMouseDown} onMouseUp={onMouseUp}
        onMouseMove={onMouseMove} onWheel={onMouseWheel} onMouseLeave={onMouseLeave}
      />
    </div>
  );
};
