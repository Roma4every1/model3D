import { ProfileStage } from './stage';
import { ProfileLoader } from './loader';


/** Создаёт состояние профиля. */
export function settingsToProfileState(): ProfileState {
  const stage = new ProfileStage();
  const loader = new ProfileLoader();
  const observer = new ResizeObserver(() => { stage.resize(); stage.render(); });
  const loading: ProfileLoading = {percentage: 0, status: null};
  return {observer, stage, loader, loading, canvas: undefined};
}
