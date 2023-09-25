import { MapAction, MapActionType } from './map.reducer';


/** Добавляет в хранилище новую мультикарту. */
export function addMultiMap(id: ClientID, templateFormID: FormID, configs: MapItemConfig[]): MapAction {
  return {type: MapActionType.ADD_MULTI_MAP, payload: {id, templateFormID, configs}};
}
/** Устанавливает значение параметра синхронизации. */
export function setMultiMapSync(id: ClientID, sync: boolean): MapAction {
  return {type: MapActionType.SET_SYNC, payload: {id, sync}};
}

/** Добавляет в хранилище состояний карт новую карту. */
export function createMapState(payload: FormStatePayload): MapAction {
  return {type: MapActionType.CREATE, payload};
}
export function setMapLoading(id: FormID, l: Partial<MapLoading>): MapAction {
  return {type: MapActionType.SET_LOADING, payload: {id, loading: l}};
}
export function setMapCanvas(id: FormID, canvas: HTMLCanvasElement): MapAction {
  return {type: MapActionType.SET_CANVAS, payload: {id, canvas: canvas as MapCanvas}};
}
/** Установить какое-либо поле хранилища карты. */
export function setMapField(id: FormID, field: keyof MapState, value: any): MapAction {
  return {type: MapActionType.SET_FIELD, payload: {id, field, value}};
}
/** Добавить в состояние карты трассу и отрисовать. */
export function applyTraceToMap(id: FormID, model: TraceModel, updateViewport: boolean): MapAction {
  return {type: MapActionType.SET_TRACE, payload: {id, model, updateViewport}};
}
