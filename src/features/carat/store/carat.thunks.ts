import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { setCaratLoading } from './carat.actions';


/** Обновляет данные каротажной диаграммы. */
export function setCaratData(id: FormID, data: ChannelDataDict): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const { objects, carats } = getState();
    const { stage, loader, loading } = carats[id];
    const { well: { model: currentWell }, trace: { model: currentTrace } } = objects;
    if (!loading) dispatch(setCaratLoading(id, true));

    if (currentTrace) {
      if (currentTrace.nodes.length) stage.setTrackList(currentTrace.nodes);
    } else if (currentWell) {
      stage.setTrackList([currentWell]);
    } else {
      return;
    }

    const flag = ++loader.flag;
    const caratData = await loader.getCaratData(stage.wellIDs, data);
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
