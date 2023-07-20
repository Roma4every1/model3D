import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { setCaratChannelData } from './carat.actions';


/** Обновляет данные каротажной диаграммы. */
export function setCaratData(id: FormID, data: ChannelDataDict): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState();
    const { stage, traceLoader } = state.carats[id];

    const dataList: ChannelDataDict[] = stage.traceMode
      ? await traceLoader.getData(state, stage.wellIDs, data)
      : [data];

    stage.setChannelData(dataList);
    stage.render();

    await stage.setCurveData(dataList);
    dispatch(setCaratChannelData(id, dataList));
    stage.render();
  };
}

export function updateCaratData(id: FormID): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const { stage, lastData } = getState().carats[id];
    await stage.setCurveData(lastData);
    stage.render();
  };
}
