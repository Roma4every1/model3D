import { ParametersAction, ParameterActionType } from './parameters.reducer';


/** Установить наборы параметров для указанной формы. */
export function setParamDict(dict: ParamDict): ParametersAction {
  return {type: ParameterActionType.SET, payload: dict};
}

/** Обновить значение параметра. */
export function updateParam(clientID: FormID, id: ParameterID, value: any): ParametersAction {
  return {type: ParameterActionType.UPDATE, payload: {clientID, id, value}};
}

/** Обновить значение нескольких параметров. */
export function updateParams(payload: UpdateParamData[]): ParametersAction {
  return {type: ParameterActionType.UPDATE_MULTIPLE, payload};
}
