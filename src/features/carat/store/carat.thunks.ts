import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { setCaratActiveCurve, setCaratChannelData } from './carat.actions';


/** Обновляет данные каротажной диаграммы. */
export function setCaratData(id: FormID, data?: ChannelDataDict): Thunk {
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

/** Задать для каротажной формы показ указанной трассы. */
export function setCaratTrace(id: FormID, model: TraceModel): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState();
    const caratState = state.carats[id];
    const caratTraceData = await caratState.traceLoader.getCaratTraceData(state, model);
    console.log(caratTraceData);
  };
}
