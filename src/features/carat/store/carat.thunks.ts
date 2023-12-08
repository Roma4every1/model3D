import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { CurveManager } from '../lib/curve-manager';
import { setCaratLoading } from './carat.actions';


/** Обновляет данные каротажной диаграммы. */
export function setCaratData(id: FormID, data: ChannelDict): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const { objects, carats } = getState();
    const { stage, loader } = carats[id];
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

    loader.setLoading = (loading: Partial<CaratLoading>) => {
      if (loading.status) loading.status = 'carat.loading.' + loading.status;
      dispatch(setCaratLoading(id, loading));
    };

    const flag = ++loader.flag;
    const caratData = await loader.loadCaratData(stage.wellIDs, data);
    if (flag !== loader.flag) return;

    stage.setData(caratData, loader.cache);
    loader.checkCacheSize();
    loader.setLoading({percentage: 100});
    stage.render();
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
    const loadedIDs = await loader.loadCurveData(visibleCurves.map(curve => curve.id), false);
    curveManager.setCurvePointData(loadedIDs, loader.cache);
    if (track.constructionMode) track.transformer.transformCurves(visibleCurves);

    loader.checkCacheSize();
    track.updateGroupRects();
    stage.updateTrackRects();
    stage.resize();
    stage.render();
  };
}
