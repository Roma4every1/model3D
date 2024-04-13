import { useSelector } from 'react-redux';
import { profileStateSelector } from '../store/profile.selectors.ts';
import {
  channelDictSelector,
} from '../../../entities/channels';
import {MouseEvent, useCallback, useEffect, useLayoutEffect, useRef} from "react";
import {compareObjects, useDispatch} from "../../../shared/lib";
import {traceStateSelector} from "../../../entities/objects";
import {setProfileData} from "../store/profile.thunks.ts";
import {setProfileCanvas} from "../store/profile.actions.ts";
import {LoadingStatus, TextInfo} from "../../../shared/ui";
import './profile.scss'

export const Profile = ({id, channels}: FormState) => {
  const dispatch = useDispatch();
  const isOnMoveRef = useRef<boolean>(false);

  const profileState: ProfileState = useSelector(profileStateSelector.bind(id));
  const { canvas, stage, loading } = profileState;

  const { model: currentTrace } = useSelector(traceStateSelector);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const channelNames = channels.map(c => c.name);
  const channelData: ChannelDict =
    useSelector(channelDictSelector.bind(channelNames), compareObjects);

  useEffect(() => {
    dispatch(setProfileData(id, currentTrace, channelData));
  }, [dispatch, channelData, id, currentTrace]);

  // обновление ссылки на холст
  useLayoutEffect(() => {
    if (loading.percentage < 100) return;
    if (canvasRef.current === canvas) return;

    dispatch(setProfileCanvas(id, canvasRef.current));
    stage.resize();
    stage.render();
  }, [canvas, dispatch, id, stage, loading.percentage]);

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

  if (loading.percentage < 100) return <LoadingStatus {...loading}/>;
  return (
    <div className={'profile-container'}>
      <canvas className={'profile-canvas'}
              ref={canvasRef}
              tabIndex={0}
              onMouseMove={onMouseMove}
              onMouseDown={onMouseDown}
              onMouseUp={onMouseUp}
      />
    </div>
  )
};
