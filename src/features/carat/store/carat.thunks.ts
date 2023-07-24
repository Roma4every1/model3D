import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { setCaratLoading } from './carat.actions';


/** Обновляет данные каротажной диаграммы. */
export function setCaratData(id: FormID, data: ChannelDataDict): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const state = getState().carats[id];
    const { stage, loader, loading } = state;
    if (!loading) dispatch(setCaratLoading(id, true));

    const flag = loader.flag + 1;
    const caratData = await loader.getCaratData(stage.wellIDs, data);
    console.log(caratData);
    if (flag !== loader.flag) return;

    stage.setData(caratData, loader.cache);
    stage.render();
    dispatch(setCaratLoading(id, false));
  };
}

export function updateCaratData(id: FormID): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const { stage } = getState().carats[id];
    stage.render();
  };
}
