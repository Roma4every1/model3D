import { ProfileStage } from './stage';
import { ProfileLoader } from './loader';


/** Создаёт состояние профиля. */
export function settingsToProfileState(): ProfileState {
  const stage = new ProfileStage();
  const observer = new ResizeObserver(() => { stage.resize(); stage.render(); });

  const loader = new ProfileLoader();
  const parameters: ProfileParameters = {strata: undefined, selectedStrata: undefined, ratio: 5};
  return {observer, stage, loader, loading: {percentage: 0}, parameters, canvas: undefined};
}
