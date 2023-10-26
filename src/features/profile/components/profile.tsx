import { useSelector } from 'react-redux';
import { profileStateSelector } from '../store/profile.selectors.ts';
import {channelSelector} from '../../../entities/channels';
import {useEffect, useLayoutEffect, useRef} from "react";
import { useDispatch } from "../../../shared/lib";
import {traceStateSelector} from "../../../entities/objects";
import {setProfileData} from "../store/profile.thunks.ts";
import {setProfileCanvas} from "../store/profile.actions.ts";
import {LoadingStatus} from "../../../shared/ui";


export const Profile = ({id, channels}: FormState) => {
  const dispatch = useDispatch();

  const profileState: ProfileState = useSelector(profileStateSelector.bind(id));
  const { canvas, stage, loading } = profileState;

  const topBaseMapsChannel: Channel = useSelector(channelSelector.bind(channels[8].name));
  const { model: currentTrace } = useSelector(traceStateSelector);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!currentTrace) return;
    if (!topBaseMapsChannel) return;

    dispatch(setProfileData(id, topBaseMapsChannel));
  }, [dispatch, topBaseMapsChannel, id, currentTrace]);

  // обновление ссылки на холст
  useLayoutEffect(() => {
    if (loading.percentage < 100) return;
    if (canvasRef.current === canvas) return;
    dispatch(setProfileCanvas(id, canvasRef.current));
    stage.resize();
    stage.render();
  }, );

  if (loading.percentage < 100) return <LoadingStatus {...loading}/>;
  return (
    <div className={'profile-container'}>
      <canvas ref={canvasRef} tabIndex={0} style={{border: '1px solid black'}} />
    </div>
  )
};
