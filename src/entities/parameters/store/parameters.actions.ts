import { ParametersAction, ParametersActions } from './parameters.reducer';


/** Установить наборы параметров для указанной формы. */
export const setParamDict = (dict: ParamDict): ParametersAction => {
  return {type: ParametersActions.SET, payload: dict};
};

/** Обновить значение параметра. */
export const updateParam = (clientID: FormID, id: ParameterID, value: any): ParametersAction => {
  return {type: ParametersActions.UPDATE, payload: {clientID, id, value}};
};

/** Обновить значение нескольких параметров. */
export const updateParams = (payload: UpdateParamData[]): ParametersAction => {
  return {type: ParametersActions.UPDATE_MULTIPLE, payload}
};

/** Очистить параметры конкретной формы или полностью. */
export const clearParams = (clientID?: FormID): ParametersAction => {
  return {type: ParametersActions.CLEAR, payload: clientID};
};
