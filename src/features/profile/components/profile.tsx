import { useSelector } from 'react-redux';
import { profileStateSelector } from '../store/profile.selectors.ts';
import {MouseEvent, useEffect, useLayoutEffect, useRef, WheelEvent} from "react";
import {useDispatch} from "../../../shared/lib";
import {
  currentPlaceSelector,
  stratumStateSelector,
  traceStateSelector
} from "../../../entities/objects";
import {setProfileData, setProfilePlastsData} from "../store/profile.thunks.ts";
import {setProfileCanvas} from "../store/profile.actions.ts";
import {LoadingStatus, TextInfo} from "../../../shared/ui";
import './profile.scss'


export const Profile = ({id}: FormState) => {
  const dispatch = useDispatch();
  const isOnMoveRef = useRef<boolean>(false);

  const profileState: ProfileState = useSelector(profileStateSelector.bind(id));
  const { canvas, loader, stage, loading } = profileState;

  const { model: currentTrace } = useSelector(traceStateSelector);
  const currentPlace = useSelector(currentPlaceSelector);
  const { model: currentStratum } = useSelector(stratumStateSelector);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // загрузка данных доступных пластов
  useEffect(() => {
    const objects: GMMOJobObjectParameters = {
      trace: currentTrace,
      place: currentPlace,
      stratum: currentStratum
    };
    dispatch(setProfilePlastsData(id, objects));
  }, [dispatch, id, currentTrace, currentPlace, currentStratum]);

  // загрузка данных профиля
  useEffect(() => {
    const objects: GMMOJobObjectParameters = {
      trace: currentTrace,
      place: currentPlace,
      stratum: currentStratum
    };
    if (!loader?.activePlasts?.length) return;

    dispatch(setProfileData(id, objects));
  }, [dispatch, id, loader?.activePlasts, currentTrace, currentPlace, currentStratum]);

  // обновление ссылки на холст
  useLayoutEffect(() => {
    if (loading?.percentage < 100) return;
    if (canvasRef.current === canvas) return;
    if (!canvasRef.current) return;

    dispatch(setProfileCanvas(id, canvasRef.current));
  }, [canvas, dispatch, id, stage, loading?.percentage]);

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

  /* --- ERRORS --- */

  if (!currentPlace || !currentStratum) {
    return <TextInfo text={'profile.no-data'}/>;
  }

  if (!currentTrace) {
    return <TextInfo text={'profile.no-trace-data'}/>;
  }

  if (!loader?.activePlasts?.length) {
    return <TextInfo text={'profile.no-plast-data'}/>;
  }

  if (currentTrace && currentTrace.nodes.length === 0) {
    return <TextInfo text={'profile.no-nodes'}/>;
  }

  if (loading.percentage >= 100 && !loader?.cache?.plasts) {
    return <TextInfo text={'profile.timeout'}/>;
  }

  /* ---  --- */

  if (loading.percentage < 100) return <LoadingStatus {...loading}/>;

  return (
    <div className={'profile-container'}>
      <canvas className={'profile-canvas'}
              ref={canvasRef}
              tabIndex={0}
              onMouseDown={onMouseDown} onMouseUp={onMouseUp}
              onMouseMove={onMouseMove} onWheel={onMouseWheel} onMouseLeave={onMouseLeave}
      />
    </div>
  )
};
