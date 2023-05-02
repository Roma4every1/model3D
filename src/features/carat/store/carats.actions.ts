import { CaratsAction, CaratsActions } from './carats.reducer';


/** Добавляет в хранилище состояний каротажа новую каротажную форму. */
export const createCaratState = (id: FormID, channels: ChannelDict, formState: FormState): CaratsAction => {
  return {type: CaratsActions.CREATE, payload: {id, channels, formState}};
};

/** Устанавливает активную колонку. */
export const setCaratActiveGroup = (id: FormID, group: ICaratColumnGroup): CaratsAction => {
  return {type: CaratsActions.SET_ACTIVE_GROUP, payload: {id, group}};
};

/** Устанавливает активную кривую. */
export const setCaratActiveCurve = (id: FormID, curve: any): CaratsAction => {
  return {type: CaratsActions.SET_ACTIVE_CURVE, payload: {id, curve}};
};

/** Установить элемент холста. */
export const setCaratCanvas = (id: FormID, canvas: HTMLCanvasElement): CaratsAction => {
  return {type: CaratsActions.SET_CANVAS, payload: {id, canvas}};
};
