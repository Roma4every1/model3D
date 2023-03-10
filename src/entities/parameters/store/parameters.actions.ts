import { FormParamsAction, FormParamsActions } from './parameters.reducer';


/** Установить наборы параметров для указанной формы. */
export const setParamDict = (dict: ParamDict): FormParamsAction => {
  return {type: FormParamsActions.SET, payload: dict};
};

/** Обновить значение параметра. */
export const updateParam = (clientID: FormID, id: ParameterID, value: any): FormParamsAction => {
  return {type: FormParamsActions.UPDATE, payload: {clientID, id, value}};
};

/** Очистить параметры конкретной формы или полностью. */
export const clearParams = (clientID?: FormID): FormParamsAction => {
  return {type: FormParamsActions.CLEAR, payload: clientID};
};
