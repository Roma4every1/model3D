import { CaratAction, CaratActionType } from './carat.reducer';


/** Добавляет в хранилище состояний каротажа новую каротажную форму. */
export function createCaratState(payload: FormStatePayload): CaratAction {
  return {type: CaratActionType.CREATE, payload};
}

/** Обновляет данные каналов. */
export function setCaratLoading(id: FormID, loading: boolean): CaratAction {
  return {type: CaratActionType.SET_LOADING, payload: {id, loading}};
}

/** Установить элемент холста. */
export function setCaratCanvas(id: FormID, canvas: HTMLCanvasElement): CaratAction {
  return {type: CaratActionType.SET_CANVAS, payload: {id, canvas}};
}
