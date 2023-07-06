import { ParametersAction, ParametersActions } from './parameters.reducer';


/** Установить наборы параметров для указанной формы. */
export function setParamDict(dict: ParamDict): ParametersAction {
  return {type: ParametersActions.SET, payload: dict};
}

/** Обновить значение параметра. */
export function updateParam(clientID: FormID, id: ParameterID, value: any): ParametersAction {
  return {type: ParametersActions.UPDATE, payload: {clientID, id, value}};
}

/** Обновить значение нескольких параметров. */
export function updateParams(payload: UpdateParamData[]): ParametersAction {
  return {type: ParametersActions.UPDATE_MULTIPLE, payload}
}

/** Очистить параметры конкретной формы или полностью. */
export function clearParams(clientID?: FormID): ParametersAction {
  return {type: ParametersActions.CLEAR, payload: clientID};
}
