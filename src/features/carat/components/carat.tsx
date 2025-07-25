import type { KeyboardEvent, MouseEvent } from 'react';
import { useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useChannels } from 'entities/channel';
import { useCurrentStratum } from 'entities/objects';
import { TextInfo, LoadingStatus } from 'shared/ui';

import './carat.scss';
import { useCaratState } from '../store/carat.store';
import { setCaratData } from '../store/carat.thunks';
import { setCaratCanvas } from '../store/carat.actions';


/** Каротажная диаграмма. */
export const Carat = ({id, loading: l}: SessionClient) => {
  const { stage, canvas, channels, lookups, loading } = useCaratState(id);
  const channelData = useChannels(channels);
  const lookupData = useChannels(lookups);
  const currentStratum = useCurrentStratum();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isOnMoveRef = useRef<boolean>(false);

  // сброс актуальности справочников
  useEffect(() => {
    stage.actualLookup = false;
  }, [lookupData, stage]);

  // обновление данных
  useEffect(() => {
    if (l.status === 'done') setCaratData(id).then();
  }, [l.status, channelData, id]);

  // выравнивание по активному пласту
  useEffect(() => {
    if (loading.percentage < 100 || !currentStratum) return;
    stage.alignByStratum(currentStratum.id);
    stage.render();
  }, [currentStratum, loading, stage]);

  // обновление ссылки на холст
  useLayoutEffect(() => {
    if (canvasRef.current === canvas) return;
    setCaratCanvas(id, canvasRef.current);
  });

  const onWheel = useCallback((e: WheelEvent) => {
    if (e.shiftKey) return; // горизонтальный скрол
    if (e.ctrlKey) e.preventDefault();
    const direction = e.deltaY > 0 ? 1 : -1;
    const { offsetX: x, offsetY: y } = e;
    stage.handleMouseWheel({x, y}, direction, e.ctrlKey);
  }, [stage]);

  // через ReactElement.onWheel нельзя из-за passive: false
  useEffect(() => {
    canvas?.addEventListener('wheel', onWheel, {passive: false});
    return () => canvas?.removeEventListener('wheel', onWheel);
  }, [canvas, onWheel]);

  if (loading.percentage < 0 || loading.status === 'base.no-data') {
    return <TextInfo text={loading.status}/>;
  }
  if (loading.percentage < 100) {
    return <LoadingStatus {...loading}/>;
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const changed = stage.handleKeyDown(e.nativeEvent.key);
    if (changed) stage.render();
  };

  const onMouseDown = (e: MouseEvent) => {
    isOnMoveRef.current = true;
    const { offsetX: x, offsetY: y } = e.nativeEvent;
    stage.handleMouseDown({x, y});
  };

  const onMouseUp = () => {
    isOnMoveRef.current = false;
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isOnMoveRef.current) return;
    const { offsetX: x, offsetY: y } = e.nativeEvent;
    stage.handleMouseMove({x, y}, e.nativeEvent.movementY);
  };

  return (
    <div className={'carat-container'}>
      <canvas
        ref={canvasRef} tabIndex={0} onKeyDown={onKeyDown}
        onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseMove={onMouseMove}
      />
    </div>
  );
};
