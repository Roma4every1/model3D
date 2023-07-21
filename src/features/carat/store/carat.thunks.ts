import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { setCaratChannelData } from './carat.actions';


/*
Загрузка данных трека:
1. загрузка данных литологии и т.п.
2. загрузка данных кривых (без точек)
3. загрузка точек кривых по умолчанию
*/

/** Обновляет данные каротажной диаграммы. */
export function setCaratData(id: FormID, data: ChannelDataDict): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState();
    const { stage, loader } = state.carats[id];

    let dataList: ChannelDataDict[];
    if (stage.traceMode) {
      const dataPromise = loader.loadWellData(state, stage.wellIDs, data);
      const flag = loader.getFlag();
      dataList = await dataPromise;
      if (flag !== loader.getFlag()) return;
    } else {
      dataList = [data];
    }

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
