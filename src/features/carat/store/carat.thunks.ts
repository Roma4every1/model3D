import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { setCaratActiveCurve, setCaratChannelData } from './carat.actions';


/** Обновляет данные каротажной диаграммы. */
export function setCaratData(id: FormID, data?: ChannelDict): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const caratState = getState().carats[id];
    const stage = caratState.stage;

    if (data) {
      stage.setChannelData(data);
      stage.render();
    }

    const activeCurve = await stage.setCurveData(data ?? caratState.lastData);
    dispatch(setCaratActiveCurve(id, activeCurve));
    if (data) dispatch(setCaratChannelData(id, data));
    stage.render();
  };
}
