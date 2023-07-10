import { CaratsAction, CaratsActions } from './carat.reducer';


/** Добавляет в хранилище состояний каротажа новую каротажную форму. */
export function createCaratState(id: FormID, channels: ChannelDict, formState: FormState): CaratsAction {
  return {type: CaratsActions.CREATE, payload: {id, channels, formState}};
}

/** Устанавливает активную колонку. */
export function setCaratActiveGroup(id: FormID, group: ICaratColumnGroup): CaratsAction {
  return {type: CaratsActions.SET_ACTIVE_GROUP, payload: {id, group}};
}

/** Устанавливает активную кривую. */
export function setCaratActiveCurve(id: FormID, curve: any): CaratsAction {
  return {type: CaratsActions.SET_ACTIVE_CURVE, payload: {id, curve}};
}

/** Обновляет данные каналов. */
export function setCaratChannelData(id: FormID, data: ChannelDict): CaratsAction {
  return {type: CaratsActions.SET_DATA, payload: {id, data}};
}

/** Установить элемент холста. */
export function setCaratCanvas(id: FormID, canvas: HTMLCanvasElement): CaratsAction {
  return {type: CaratsActions.SET_CANVAS, payload: {id, canvas}};
}
