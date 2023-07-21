import { CaratAction, CaratActionType } from './carat.reducer';


/** Добавляет в хранилище состояний каротажа новую каротажную форму. */
export function createCaratState(payload: FormStatePayload): CaratAction {
  return {type: CaratActionType.CREATE, payload};
}

/** Устанавливает активную колонку. */
export function setCaratActiveGroup(id: FormID, group: ICaratColumnGroup): CaratAction {
  return {type: CaratActionType.SET_ACTIVE_GROUP, payload: {id, group}};
}

/** Устанавливает активную кривую. */
export function setCaratActiveCurve(id: FormID, curve: any): CaratAction {
  return {type: CaratActionType.SET_ACTIVE_CURVE, payload: {id, curve}};
}

/** Обновляет данные каналов. */
export function setCaratChannelData(id: FormID, data: ChannelDataDict[]): CaratAction {
  return {type: CaratActionType.SET_DATA, payload: {id, data}};
}

/** Установить элемент холста. */
export function setCaratCanvas(id: FormID, canvas: HTMLCanvasElement): CaratAction {
  return {type: CaratActionType.SET_CANVAS, payload: {id, canvas}};
}
