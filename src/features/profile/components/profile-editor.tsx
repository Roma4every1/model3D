import { MapStage } from 'features/map/lib/map-stage';
import { useProfileState } from '../store/profile.store';
import { ProfileStrataView } from './profile-strata';
import { ProfileLayerList } from './profile-layer-list';
import './profile.scss';


export const ProfileEditor = ({id}: {id: FormID}) => {
  const state = useProfileState(id);
  if (!state) return null;

  const strata = state.loader?.cache?.strata;
  const stage = state.stage as MapStage;

  return (
    <div className={'profile-editor'}>
      <ProfileStrataView id={id} strata={strata}/>
      <ProfileLayerList stage={stage}/>
    </div>
  );
};
