import type { MouseEvent, WheelEvent } from 'react';
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { LoadingStatus, TextInfo } from 'shared/ui';
import { useChannel, useChannelDict } from 'entities/channel';
import { useCurrentWell, useTraceManager, setCurrentTrace, setCurrentWell } from 'entities/objects';
import { updateParamDeep, useClientParameterValue, rowToParameterValue } from 'entities/parameter';
import { useMapState } from '../store/map.store';
import { fetchMapData, showMapPropertyWindow } from '../store/map.thunks';
import { setMapField, setMapCanvas, applyTraceToMap } from '../store/map.actions';
import { getFullTraceViewport, getTraceMapElement, handleTraceClick } from '../lib/traces-map-utils';
import { getFullViewport } from '../lib/map-utils';
import { checkDistancePoints } from '../lib/selecting-utils';
import { MapMode } from '../lib/constants';
import { InclinometryModePlugin } from '../lib/plugins';


export const Map = ({id, parent, channels}: Pick<SessionClient, 'id' | 'parent' | 'channels'>) => {
  const currentWell = useCurrentWell();
  const { model: currentTrace, editing: traceEditing } = useTraceManager();

  const [isMapExist, setIsMapExist] = useState(true);
  const mapState = useMapState(id);

  const canvasRef = useRef(null);
  const { canvas, stage, loading } = mapState;
  const mapData = stage.getMapData();

  const isPartOfDynamicMultiMap = channels === null;
  const activeChannelName = isPartOfDynamicMultiMap ? null : channels[0]?.name;
  const activeChannel = useChannel(activeChannelName);
  const inclAngle = useClientParameterValue(parent, 'inclinometryViewAngle');

  const inclPlugin = stage.plugins.find(it =>
    it instanceof InclinometryModePlugin
  ) as InclinometryModePlugin;

  // проверка параметров формы
  useEffect(() => {
    if (isPartOfDynamicMultiMap) return;
    const rows = activeChannel?.data?.rows;
    if (!rows || rows.length === 0) {
      if (stage.inclinometryModeOn && !canvas) {
        stage.setData({layers: [], x: 0, y: 0, scale: 1} as MapData);
        setMapCanvas(id, canvasRef.current);
        inclPlugin.setUpdateAngleParamFunction((value: number) => updateParamDeep(inclAngle.id, value));
        setIsMapExist(true);
        return;
      }
      if (loading.percentage < 0) return;
      return setIsMapExist(false);
    }

    const firstRow = rows[0];
    const owner = firstRow[12];
    const mapID = String(firstRow[0]);

    const changeOwner = owner !== mapState.owner;
    const changeMapID = mapID !== mapState.mapID;
    const activeRowParameter = activeChannel.config.activeRowParameter;

    if (activeRowParameter && (changeOwner || changeMapID)) {
      const value = rowToParameterValue(firstRow, activeChannel);
      updateParamDeep(activeRowParameter, value).then();
    }
    if (changeOwner) {
      setMapField(id, 'owner', owner);
    }
    if (changeMapID) {
      setMapField(id, 'mapID', mapID);
      fetchMapData(id).then();
    }
    setIsMapExist(true);
  }, [mapState?.owner, mapState?.mapID, activeChannel, id, isPartOfDynamicMultiMap, stage.inclinometryModeOn]); // eslint-disable-line

  // обновление ссылки на холст
  useLayoutEffect(() => {
    if (!mapData || canvasRef.current === canvas) return;
    setMapCanvas(id, canvasRef.current);
    if (!canvasRef.current) return;

    let initialViewport: MapViewport;
    if (stage.inclinometryModeOn && currentWell) {
      initialViewport = stage.getWellViewport(currentWell.id);
    } else if (currentTrace) {
      initialViewport = getFullTraceViewport(getTraceMapElement(currentTrace), canvasRef.current);
    } else if (currentWell) {
      initialViewport = stage.getWellViewport(currentWell.id);
    }
    if (!initialViewport) {
      initialViewport = getFullViewport(mapData.layers, canvasRef.current);
    }
    stage.render(initialViewport);
  });

  /* --- --- */

  const lastWellRef = useRef<WellModel>(null);
  const lastTraceRef = useRef<TraceModel>(null);

  useEffect(() => {
    if (!mapData || loading.percentage < 100) return;
    const lastWell = lastWellRef.current;
    const lastTrace = lastTraceRef.current;

    const updateTraceViewport = !stage.inclinometryModeOn && currentTrace &&
      (!lastTrace || currentTrace.id !== lastTrace.id || (traceEditing && !stage.traceEditing));

    if (currentTrace !== lastTrace) applyTraceToMap(id, currentTrace, updateTraceViewport);
    stage.traceEditing = traceEditing;

    const updateWellViewport = !updateTraceViewport && currentWell &&
      (!lastWell || currentWell.id !== lastWell.id);

    if (updateWellViewport) {
      const viewport = stage.getWellViewport(currentWell.id);
      if (viewport) stage.getCanvas().events?.emit('sync', viewport);
    }
    lastWellRef.current = currentWell;
    lastTraceRef.current = currentTrace;
  }, [currentWell, currentTrace, traceEditing]); // eslint-disable-line

  /* --- --- */

  const channelDict = useChannelDict(channels?.map(c => c.name) ?? []);

  // обновление каналов плагинов
  useEffect(() => {
    if (stage.plugins.length === 0) return;
    stage.plugins.forEach(p => { p.setData(channelDict, inclAngle); });
    stage.render();
  }, [channelDict, stage, inclAngle]);

  /* --- --- */

  if (!isMapExist) return <TextInfo text={'map.not-found'}/>;
  if (loading.percentage < 0) return <TextInfo text={'map.not-loaded'}/>;
  if (loading.percentage < 100) return <LoadingStatus {...loading}/>;

  const onMouseDown = ({nativeEvent}: MouseEvent) => {
    if (nativeEvent.button !== 0 || stage.inclinometryModeOn) return;
    stage.handleMouseDown(nativeEvent);

    const maxScale = mapData.layers?.find(l => l.elementType === 'sign')?.getMaxScale() ?? 50_000;
    if (mapData.scale > maxScale) return;
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
        setCurrentTrace({...currentTrace});
      } else {
        setCurrentWell(parseInt(mapPoint.UWID)).then();
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
      showMapPropertyWindow(id, element);
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
