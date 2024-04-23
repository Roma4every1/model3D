import { MouseEvent, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { LoadingStatus, TextInfo } from 'shared/ui';
import { useCurrentTrace } from 'entities/objects';
import { useChannelDict } from 'entities/channel';

import './profile.scss';
import { useProfileState } from '../store/profile.store';
import { setProfileCanvas, setProfileData } from '../store/profile.actions';


export const Profile = ({id, channels}: SessionClient) => {
  const isOnMoveRef = useRef<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { canvas, stage, loading } = useProfileState(id);
  const channelData = useChannelDict(channels.map(c => c.name));
  const { model: currentTrace } = useCurrentTrace();

  useEffect(() => {
    setProfileData(id, currentTrace, channelData).then();
  }, [channelData, id, currentTrace]);

  // обновление ссылки на холст
  useLayoutEffect(() => {
    if (loading.percentage < 100) return;
    if (canvasRef.current === canvas) return;

    setProfileCanvas(id, canvasRef.current);
    stage.resize();
    stage.render();
  }, [canvas, id, stage, loading.percentage]);

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const direction = e.deltaY > 0 ? 1 : -1;
    const { offsetX: x, offsetY: y } = e;
    stage.handleMouseWheel({x, y}, direction, e.shiftKey);
  }, [stage]);

  // через ReactElement.onWheel нельзя из-за passive: true
  useEffect(() => {
    canvas?.addEventListener('wheel', onWheel, {passive: false});
    return () => canvas?.removeEventListener('wheel', onWheel);
  }, [canvas, onWheel]);

  const onMouseDown = () => {
    isOnMoveRef.current = true;
  };

  const onMouseUp = () => {
    isOnMoveRef.current = false;
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isOnMoveRef.current) return;
    const { offsetX: x, offsetY: y } = e.nativeEvent;
    stage.handleMouseMove({x, y}, e.nativeEvent.movementX, e.nativeEvent.movementY);
  };

  if (!channelData || !currentTrace) {
    return <TextInfo text={'profile.no-data'}/>;
  }
  if (currentTrace && currentTrace.nodes.length === 0) {
    return <TextInfo text={'profile.no-nodes'}/>;
  }
  if (loading.percentage < 100) {
    return <LoadingStatus {...loading}/>;
  }

  return (
    <div className={'profile-container'}>
      <canvas
        className={'profile-canvas'} ref={canvasRef} tabIndex={0}
        onMouseMove={onMouseMove} onMouseDown={onMouseDown} onMouseUp={onMouseUp}
      />
    </div>
  );
};
