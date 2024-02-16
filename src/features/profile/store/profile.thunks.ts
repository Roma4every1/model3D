import {Dispatch} from "redux";
import {StateGetter, Thunk} from "../../../shared/lib";
import {setProfileLoading} from "./profile.actions.ts";


/** Обновляет данные профиля. */
export function setProfileData(id: FormID, trace: TraceModel, channels: ChannelDict): Thunk {

  return async (dispatch: Dispatch, getState: StateGetter) => {
    const { profiles } = getState();
    const { loader, stage } = profiles[id];

    loader.setLoading = (loading: Partial<ProfileLoading>) => {
      if (loading.status) loading.status = 'profile.loading.' + loading.status;
      dispatch(setProfileLoading(id, loading));
    };

    const flag = ++loader.flag;
    await loader.loadProfileData(id, trace, channels);
    if (flag !== loader.flag) return;

    stage.setData(loader.cache);
    loader.setLoading({percentage: 100});
  };
}
