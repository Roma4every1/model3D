import {Dispatch} from "redux";
import {StateGetter, Thunk} from "../../../shared/lib";
import {setProfileLoading} from "./profile.actions.ts";


/** Обновляет данные профиля. */
export function setProfileData(id: FormID, topBaseMapChannel: Channel): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const { objects, profiles } = getState();
    const { stage, loader } = profiles[id];
    const { trace: { model: currentTrace } } = objects;

    loader.setLoading = (loading: Partial<ProfileLoading>) => {
      if (loading.status) loading.status = 'profile.loading.' + loading.status;
      dispatch(setProfileLoading(id, loading));
    };

    const flag = ++loader.flag;
    await loader.loadProfileData(id, currentTrace, topBaseMapChannel);
    if (flag !== loader.flag) return;

    stage.setData(loader.cache);
    loader.setLoading({percentage: 100});
    stage.render();
  };
}
