import { MapStage } from 'features/map/lib/map-stage';
import { useProfileState } from '../store/profile.store';
import { ProfileStrataView } from './profile-strata';
import { ProfileLayerList } from './profile-layer-list';
import './profile.scss';


export const ProfileEditor = ({id}: {id: FormID}) => {
  const state = useProfileState(id);
  const strata = state.loader?.cache?.plasts;
  const stage = state.stage as MapStage;

  return (
    <div className={'profile-editor'}>
      <ProfileStrataView id={id} strata={strata}/>
      <ProfileLayerList stage={stage}/>
    </div>
  );
};
