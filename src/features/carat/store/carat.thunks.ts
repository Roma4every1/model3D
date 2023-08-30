import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { CurveManager } from '../lib/curve-manager';
import { setCaratLoading } from './carat.actions';


/** Обновляет данные каротажной диаграммы. */
export function setCaratData(id: FormID, data: ChannelDict): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const { objects, carats } = getState();
    const { stage, loader, loading } = carats[id];
    const { well: { model: currentWell }, trace: { model: currentTrace } } = objects;

    if (currentTrace) {
      if (currentTrace.nodes.length) {
        stage.setTrackList(currentTrace.nodes);
      } else {
        return;
      }
    } else if (currentWell) {
      stage.setTrackList([currentWell]);
    } else {
      return;
    }

    if (!loading) dispatch(setCaratLoading(id, true));
    const flag = ++loader.flag;
    const caratData = await loader.getCaratData(stage.wellIDs, data);
    if (flag !== loader.flag) return;

    stage.setData(caratData, loader.cache);
    stage.render();
    dispatch(setCaratLoading(id, false));
  };
}

/** Дозагрузить каротажные кривые. */
export function loadCaratCurves(id: FormID, group: ICaratColumnGroup): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const { stage, loader } = getState().carats[id];
    const curveManager: CurveManager = group.curveManager;
    const track = stage.getActiveTrack();

    const visibleCurves = curveManager.getVisibleCurves();
    group.groupCurves(visibleCurves);
    const loadedIDs = await loader.loadCurveData(visibleCurves.map(curve => curve.id));
    curveManager.setCurvePointData(loadedIDs, loader.cache);

    track.updateGroupRects();
    stage.updateTrackRects();
    stage.render();
  };
}
