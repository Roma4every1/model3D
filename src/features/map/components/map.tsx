import type { MouseEvent, WheelEvent } from 'react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { TextInfo } from 'shared/ui';
import { useChannelDict } from 'entities/channel';
import { useParameterValue } from 'entities/parameter';
import { useCurrentWell, useCurrentTrace, useCurrentSite, useTraceEditing, useSiteEditMode } from 'entities/objects';
import { useMapState } from '../store/map.store';
import { updateMap } from '../store/map.thunks';
import { setMapCanvas, setMapObjects } from '../store/map.actions';
import { getFullViewport } from '../lib/map-utils';


export const Map = ({id}: Pick<SessionClient, 'id'>) => {
  const currentWell = useCurrentWell();
  const currentTrace = useCurrentTrace();
  const currentSite = useCurrentSite();

  const traceEditing = useTraceEditing();
  const siteEditMode = useSiteEditMode();

  const { stage, canvas, status, usedChannels, usedParameters } = useMapState(id);
  const channelDict = useChannelDict(usedChannels);
  const inclAngle = useParameterValue(usedParameters.incl);

  const channel = channelDict[usedChannels[0]];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapData = stage.getMapData();

  useEffect(() => {
    if (channel) updateMap(id, channel).then();
  }, [channel, id]);

  useLayoutEffect(() => {
    const currentCanvas = canvasRef.current;
    if (!mapData || currentCanvas === canvas) return;
    setMapCanvas(id, currentCanvas);
    if (currentCanvas) stage.render(getFullViewport(currentCanvas, mapData.layers));
  });

  useEffect(() => {
    if (status !== 'ok') return;
    const mapObjects = {
      incl: {well: currentWell?.id, data: channelDict, angle: inclAngle},
      well: currentWell?.id, trace: currentTrace, site: currentSite,
    };
    setMapObjects(id, mapObjects);
  }, [currentWell, currentTrace, currentSite, channelDict, inclAngle, status, id]);

  useEffect(() => {
    const mode = stage.getMode();
    const set = (id: MapModeID) => { stage.setMode(id); stage.render(); }
    if (traceEditing && mode !== 'trace-edit') return set('trace-edit');
    if (!traceEditing && mode === 'trace-edit') return set('default');
    if (siteEditMode && mode !== siteEditMode) return set(siteEditMode);
    if (!siteEditMode && mode.startsWith('site')) return set('default');
  }, [traceEditing, siteEditMode, stage]);

  if (status !== 'ok') return <TextInfo text={'map.' + status}/>;
  const mode = stage.getModeProvider();

  return (
    <div className={'map-container'}>
      <canvas
        ref={canvasRef} style={{cursor: mode.cursor}}
        onWheel={(e: WheelEvent) => stage.handleWheel(e.nativeEvent)}
        onMouseDown={(e: MouseEvent) => stage.handleMouseDown(e.nativeEvent)}
        onMouseUp={(e: MouseEvent) => stage.handleMouseUp(e.nativeEvent)}
        onMouseMove={(e: MouseEvent) => stage.handleMouseMove(e.nativeEvent)}
        onMouseLeave={(e: MouseEvent) => stage.handleMouseLeave(e.nativeEvent)}
      />
    </div>
  );
};
