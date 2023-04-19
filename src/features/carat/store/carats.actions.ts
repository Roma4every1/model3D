import { CaratsAction, CaratsActions } from './carats.reducer';


/** Добавляет в хранилище состояний каротажа новую каротажную форму. */
export const createCaratState = (id: FormID, channels: ChannelDict): CaratsAction => {
  return {type: CaratsActions.CREATE, payload: {id, channels}};
};

/** Устанавливает активную колонку. */
export const setCaratActiveColumn = (id: FormID, column: ICaratColumn): CaratsAction => {
  return {type: CaratsActions.SET_ACTIVE_COLUMN, payload: {id, column}};
};

/** Установить элемент холста. */
export const setCaratCanvas = (id: FormID, canvas: HTMLCanvasElement): CaratsAction => {
  return {type: CaratsActions.SET_CANVAS, payload: {id, canvas}};
};
