import { CaratsAction, CaratsActions } from './carats.reducer';


/** Добавляет в хранилище состояний каротажа новую каротажную форму. */
export const createCaratState = (formID: FormID): CaratsAction => {
  return {type: CaratsActions.ADD, formID};
};

/** Установить элемент холста. */
export const setCaratCanvas = (formID: FormID, canvas: HTMLCanvasElement): CaratsAction => {
  return {type: CaratsActions.SET_CANVAS, formID, payload: canvas};
};

/** Установить отрисовщик каротажа. */
export const setCaratDrawer = (formID: FormID, drawer: ICaratDrawer): CaratsAction => {
  return {type: CaratsActions.SET_DRAWER, formID, payload: drawer};
};
