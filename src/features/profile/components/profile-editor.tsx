import {useSelector} from "react-redux";
import {profileStateSelector} from "../store/profile.selectors.ts";
import {ProfilePlastList} from "./profile-plast-list.tsx";
import {ProfileLayerList} from "./profile-layer-list.tsx";
import {MapStage} from "../../map/lib/map-stage.ts";
import './profile.scss'

interface ProfileEditorProps {
  /** ID формы профиля. */
  id: FormID;
}


export const ProfileEditor = ({id}: ProfileEditorProps) => {
  const profileState: ProfileState = useSelector(profileStateSelector.bind(id));
  const { stage, loader  } = profileState;

  const mapStage = stage as unknown as MapStage;
  const plastList = loader?.cache?.plasts;

  return (
    <div className={'profile-editor'}>
      <ProfilePlastList id={id} plastList={plastList} />
      <ProfileLayerList stage={mapStage} />
    </div>
  )
};
