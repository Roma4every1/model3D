import {ProfileLoader} from "../lib/loader-gmmo.ts";
import {ProfileStage} from "./stage-gmmo.ts";


/** Создаёт состояние профиля. */
export function settingsToProfileState(): ProfileState {
  const stage = new ProfileStage();
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
