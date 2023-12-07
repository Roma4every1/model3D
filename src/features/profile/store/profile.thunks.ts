import {Dispatch} from "redux";
import {StateGetter, Thunk} from "../../../shared/lib";
import {setProfileLoading} from "./profile.actions.ts";


/** Обновляет данные профиля. */
export function setProfileData(id: FormID, objects: GMMOJobObjectParameters): Thunk {

  return async (dispatch: Dispatch, getState: StateGetter) => {
    const { profiles } = getState();
    const { loader } = profiles[id];

    loader.setLoading = (loading: Partial<ProfileLoading>) => {
      dispatch(setProfileLoading(id, loading));
    };

    const flag = ++loader.flag;
    await loader.loadProfileData(objects);
    if (flag !== loader.flag) return;
  };
}

/** Обновляет данные достуных пластов профиля. */
export function setProfilePlastsData(id: FormID, objects: GMMOJobObjectParameters): Thunk {

  return async (dispatch: Dispatch, getState: StateGetter) => {
    const { profiles } = getState();
    const { loader } = profiles[id];

    const flag = ++loader.flag;
    await loader.loadPlData(objects);
    if (flag !== loader.flag) return;
  };
}
