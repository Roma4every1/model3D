import { useCaratStore } from './carat.store';
import { settingsToCaratState } from '../lib/adapter';
import { CaratColumnGroup } from '../rendering/column-group';


/** Добавляет в хранилище состояний каротажа новую каротажную форму. */
export function createCaratState(payload: FormStatePayload): void {
  const id = payload.state.id;
  useCaratStore.setState({[id]: settingsToCaratState(payload)});
}

/** Обновляет состояние загрузки каротажа. */
export function setCaratLoading(id: FormID, loading: Partial<CaratLoading>): void {
  const state = useCaratStore.getState()[id];
  const newLoading = {...state.loading, ...loading};
  useCaratStore.setState({[id]: {...state, loading: newLoading}});
}

/** Установить элемент холста. */
export function setCaratCanvas(id: FormID, canvas: HTMLCanvasElement): void {
  const state = useCaratStore.getState()[id];
  const { stage, observer, canvas: oldCanvas } = state;

  if (oldCanvas) observer.unobserve(oldCanvas);
  if (canvas) observer.observe(canvas);

  stage.setCanvas(canvas);
  useCaratStore.setState({[id]: {...state, canvas}});
}

/** Дозагрузить каротажные кривые. */
export async function loadCaratCurves(id: FormID, group: CaratColumnGroup): Promise<void> {
  const { stage, loader } = useCaratStore.getState()[id];
  const track = stage.getActiveTrack();
  const curveManager = group.getCurveColumn().curveManager;

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
}
