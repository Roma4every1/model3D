import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { setCaratActiveCurve } from './carats.actions';


/** Обновляет данные каротажной диаграммы. */
export const setCaratData = (id: FormID, data?: ChannelDict): Thunk => {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState();
    const caratState = state.carats[id];
    const stage = caratState.stage;

    if (data) {
      caratState.lastData = data;
      stage.getActiveTrack().getGroups().forEach((group) => {
        group.curveManager.defaultMode = true;
      });
      stage.setChannelData(data);
      stage.render();
    } else {
      data = caratState.lastData;
    }

    const activeCurve = await stage.setCurveData(data);
    dispatch(setCaratActiveCurve(id, activeCurve));
    stage.render();
  };
};
