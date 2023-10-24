import {drawerConfig} from "../lib/constants.ts";
import {ProfileLoader} from "../lib/loader.ts";
import {ProfileStage} from "./stage.ts";


/** Создаёт состояние профиля. */
export function settingsToProfileState(payload: FormStatePayload): ProfileState {
  const stage = new ProfileStage(drawerConfig);
  const loader = new ProfileLoader();

  return {
    canvas: undefined,
    stage,
    loader,
    loading: {percentage: 0, status: null},
  };
}
