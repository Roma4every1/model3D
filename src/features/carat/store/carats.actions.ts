import { CaratsAction, CaratsActions } from './carats.reducer';


/** Добавляет в хранилище состояний каротажа новую каротажную форму. */
export const createCaratState = (id: FormID, channels: ChannelDict): CaratsAction => {
  return {type: CaratsActions.CREATE, payload: {id, channels}};
};

/** Перезаписывает данные для отрисовки из каналов. */
export const setCaratData = (id: FormID, data: CaratData): CaratsAction => {
  return {type: CaratsActions.SET_DATA, payload: {id, data}};
};

/** Устанавливает активную колонку. */
export const setCaratActiveColumn = (id: FormID, column: CaratColumn): CaratsAction => {
  return {type: CaratsActions.SET_ACTIVE_COLUMN, payload: {id, column}};
};

/** Установить элемент холста. */
export const setCaratCanvas = (id: FormID, canvas: HTMLCanvasElement): CaratsAction => {
  return {type: CaratsActions.SET_CANVAS, payload: {id, canvas}};
};
