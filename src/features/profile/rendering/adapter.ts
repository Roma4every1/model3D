import { ProfileLoader } from '../lib/loader';
import { ProfileStage } from './stage';
import { drawerConfig } from '../lib/constants';


/** Создаёт состояние профиля. */
export function settingsToProfileState(): ProfileState {
  const stage = new ProfileStage(drawerConfig);
  const loader = new ProfileLoader();
  const observer = new ResizeObserver(() => { stage.resize(); stage.render(); });

  return {
    canvas: undefined,
    observer,
    stage,
    loader,
    loading: {percentage: 0, status: null},
  };
}
