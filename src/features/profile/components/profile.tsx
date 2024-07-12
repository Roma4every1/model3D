import type { MouseEvent, WheelEvent } from 'react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useCurrentTrace, useCurrentStratum, useCurrentPlace } from 'entities/objects';
import { useProfileState } from '../store/profile.store';
import { setProfileCanvas } from '../store/profile.actions';
import { updateProfile, updateProfileStrata } from '../store/profile.thunks';

import './profile.scss';
import { LoadingStatus, TextInfo } from 'shared/ui';


export const Profile = ({id}: Pick<SessionClient, 'id'>) => {
  const { canvas, stage, loading, parameters } = useProfileState(id);
  const place = useCurrentPlace();
  const stratum = useCurrentStratum();
  const trace = useCurrentTrace();

  const isOnMoveRef = useRef<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // загрузка данных доступных пластов
  useEffect(() => {
    updateProfileStrata(id, {place, stratum, trace}).then();
  }, [place, stratum, trace, id]);

  // загрузка данных профиля
  useEffect(() => {
    updateProfile(id).then();
  }, [place, stratum, trace, id]);

  // обновление ссылки на холст
  useLayoutEffect(() => {
    if (loading.percentage < 100) return;
    if (canvasRef.current !== canvas) setProfileCanvas(id, canvasRef.current);
  }, [canvas, loading.percentage, stage, id]);

  if (!place || !stratum) return <TextInfo text={'profile.no-data'}/>;
  if (!trace) return <TextInfo text={'profile.no-trace'}/>;
  if (trace.nodes.length === 0) return <TextInfo text={'profile.no-trace-nodes'}/>;
  if (!parameters.selectedStrata?.length) return <TextInfo text={'profile.no-strata'}/>;

  if (loading.percentage < 0) return <TextInfo text={loading.status}/>;
  if (loading.percentage < 100) return <LoadingStatus {...loading}/>;

  /* --- --- */

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

  return (
    <div className={'profile-container'}>
      <canvas
        ref={canvasRef} tabIndex={0}
        onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseMove={onMouseMove}
        onWheel={onMouseWheel} onMouseLeave={onMouseLeave}
      />
    </div>
  );
};
