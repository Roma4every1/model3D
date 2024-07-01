import type { MouseEvent, WheelEvent } from 'react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useCurrentTrace, useCurrentStratum, useCurrentPlace } from 'entities/objects';
import { useProfileState } from '../store/profile.store';
import { setProfileCanvas } from '../store/profile.actions';
import { setProfileData, setProfilePlastsData } from '../store/profile.thunks';

import './profile.scss';
import { LoadingStatus, TextInfo } from 'shared/ui';


export const Profile = ({id}: Pick<SessionClient, 'id'>) => {
  const { canvas, loader, stage, loading } = useProfileState(id);
  const currentPlace = useCurrentPlace();
  const currentTrace = useCurrentTrace();
  const currentStratum = useCurrentStratum();

  const isOnMoveRef = useRef<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // загрузка данных доступных пластов
  useEffect(() => {
    const objects = {trace: currentTrace, place: currentPlace, stratum: currentStratum};
    setProfilePlastsData(id, objects).then();
  }, [currentTrace, currentPlace, currentStratum, id]);

  // загрузка данных профиля
  useEffect(() => {
    if (!loader?.activeStrata?.length) return;
    const objects = {trace: currentTrace, place: currentPlace, stratum: currentStratum};
    setProfileData(id, objects).then();
  }, [id, loader?.activeStrata, currentTrace, currentPlace, currentStratum]);

  // обновление ссылки на холст
  useLayoutEffect(() => {
    if (loading?.percentage < 100) return;
    if (canvasRef.current === canvas) return;
    if (!canvasRef.current) return;
    setProfileCanvas(id, canvasRef.current);
  }, [canvas, id, stage, loading?.percentage]);

  useEffect(() => {
    if (loading?.percentage < 100) return;
    if (!loader?.cache?.profileData) return;
    stage.setData(loader.cache.profileData);
  }, [stage, loading?.percentage, loader?.cache?.profileData]);

  /* --- Events --- */

  const onMouseDown = ({nativeEvent}: MouseEvent) => {
    if (nativeEvent.button !== 0) return;
    isOnMoveRef.current = true;
    stage.handleMouseDown(nativeEvent);
  };

  const onMouseUp = () => {
    isOnMoveRef.current = false;
    stage.scroller.mouseUp();
  };

  const onMouseMove = ({nativeEvent}: MouseEvent) => {
    stage.handleMouseMove(nativeEvent);
  };
  const onMouseWheel = ({nativeEvent}: WheelEvent) => {
    if (isOnMoveRef.current) return;
    stage.handleMouseWheel(nativeEvent);
  };
  const onMouseLeave = () => {
    isOnMoveRef.current = false;
    stage.scroller.mouseUp();
  };

  /* ---  --- */

  if (!currentPlace || !currentStratum) {
    return <TextInfo text={'profile.no-data'}/>;
  }
  if (!currentTrace) {
    return <TextInfo text={'profile.no-trace-data'}/>;
  }
  if (!loader?.activeStrata?.length) {
    return <TextInfo text={'profile.no-plast-data'}/>;
  }
  if (currentTrace && currentTrace.nodes.length === 0) {
    return <TextInfo text={'profile.no-nodes'}/>;
  }
  if (loading.percentage >= 100 && !loader?.cache?.plasts) {
    return <TextInfo text={'profile.timeout'}/>;
  }
  if (loading.percentage < 100) {
    return <LoadingStatus {...loading}/>;
  }

  return (
    <div className={'profile-container'}>
      <canvas
        className={'profile-canvas'} ref={canvasRef} tabIndex={0}
        onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseMove={onMouseMove}
        onWheel={onMouseWheel} onMouseLeave={onMouseLeave}
      />
    </div>
  );
};
