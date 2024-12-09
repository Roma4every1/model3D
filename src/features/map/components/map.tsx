import type { MouseEvent, WheelEvent } from 'react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { TextInfo } from 'shared/ui';
import { useChannel, useChannelDict } from 'entities/channel';
import { useParameterValue } from 'entities/parameter';
import { useCurrentWell, useCurrentTrace, useTraceEditing, setCurrentTrace, setCurrentWell } from 'entities/objects';
import { useMapState } from '../store/map.store';
import { updateMap, showMapPropertyWindow } from '../store/map.thunks';
import { setMapCanvas, applyWellToMap, applyTraceToMap } from '../store/map.actions';
import { handleTraceClick } from '../lib/traces-map-utils';
import { getFullViewport } from '../lib/map-utils';
import { checkDistancePoints } from '../lib/selecting-utils';
import { MapStage } from '../lib/map-stage';
import { MapMode } from '../lib/constants';


export const Map = ({id, channels}: Pick<SessionClient, 'id' | 'channels'>) => {
  const currentWell = useCurrentWell();
  const currentTrace = useCurrentTrace();
  const traceEditing = useTraceEditing();

  const canvasRef = useRef(null);
  const mapState = useMapState(id);
  const { canvas, status } = mapState;
  const stage = mapState.stage as MapStage;
  const mapData = stage.getMapData();
  const channel = useChannel(channels ? channels[0]?.id : null);

  useEffect(() => {
    if (channels) updateMap(id, channel).then();
  }, [channel, channels, id]);

  // обновление ссылки на холст
  useLayoutEffect(() => {
    const currentCanvas = canvasRef.current;
    if (!mapData || currentCanvas === canvas) return;
    setMapCanvas(id, currentCanvas);
    if (!currentCanvas) return;

    if (currentWell) {
      applyWellToMap(id, currentWell.id);
    }
    if (currentTrace && !stage.inclinometryModeOn) {
      return applyTraceToMap(id, currentTrace, true);
    }
    let initialViewport: MapViewport;
    if (currentWell) {
      initialViewport = stage.getExtraObjectViewport('well');
    }
    if (!initialViewport) {
      initialViewport = getFullViewport(mapData.layers, currentCanvas);
    }
    stage.render(initialViewport);
  });

  /* --- --- */

  useEffect(() => {
    if (status !== 'ok') return;
    const lastWell: MapPoint = stage.getExtraObjectModel('well');
    const lastTrace: TraceModel = stage.getExtraObjectModel('trace');

    const updateTraceViewport = !stage.inclinometryModeOn && currentTrace &&
      (!lastTrace || currentTrace.id !== lastTrace.id);
    if (currentTrace !== lastTrace) applyTraceToMap(id, currentTrace, updateTraceViewport);

    const updateWellViewport = !updateTraceViewport && currentWell &&
      (!lastWell || currentWell.id !== lastWell.UWID);

    if (updateWellViewport) {
      applyWellToMap(id, currentWell.id, true);
    } else if (typeof lastWell?.UWID === 'number' && !currentWell) {
      applyWellToMap(id, null);
      stage.render();
    }
  }, [currentWell, currentTrace]); // eslint-disable-line react-hooks/exhaustive-deps

  /* --- --- */

  const inclPlugin = stage.getPlugin('incl');
  const inclAngle = useParameterValue(inclPlugin?.parameterID);
  const channelDict = useChannelDict(channels?.map(c => c.id) ?? []);

  // обновление угла инклинометрии
  useEffect(() => {
    if (!inclPlugin || !inclPlugin.parameterID) return;
    inclPlugin.setAngle(inclAngle);
    stage.render();
  }, [inclPlugin, inclAngle, stage]);

  // обновление каналов плагинов
  useEffect(() => {
    if (stage.plugins.length === 0) return;
    stage.plugins.forEach(p => { p.setData(channelDict); });
    stage.render();
  }, [channelDict, stage]);

  /* --- --- */

  if (status !== 'ok') {
    return <TextInfo text={'map.' + status}/>;
  }

  const onMouseDown = ({nativeEvent}: MouseEvent) => {
    if (nativeEvent.button !== 0 || stage.inclinometryModeOn) return;
    stage.handleMouseDown(nativeEvent, traceEditing);

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
        applyWellToMap(id, mapPoint.UWID, true);
        setCurrentWell(mapPoint.UWID).then();
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
