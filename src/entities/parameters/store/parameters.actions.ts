import { FormParamsAction, FormParamsActions } from './parameters.reducer';


/** Установить набор параметров для указанной формы. */
export const setParams = (formID: FormID, params: Parameter[]): FormParamsAction => {
  return {type: FormParamsActions.SET, payload: {formID, params}};
};

export const setParamDict = (dict: ParamDict): FormParamsAction => {
  return {type: FormParamsActions.SET_DICT, payload: dict};
};

/** Добавить параметр для указанной формы. */
export const addParam = (formID: FormID, parameter: Parameter): FormParamsAction => {
  return {type: FormParamsActions.ADD, payload: {formID, parameter}};
};

/** Обновить значение параметра. */
export const updateParam = (formID: FormID, id: ParameterID, value: any): FormParamsAction => {
  return {type: FormParamsActions.UPDATE, payload: {formID, id, value}};
};

/** Очистить параметры конкретной формы или полностью. */
export const clearParams = (formID?: FormID): FormParamsAction => {
  return {type: FormParamsActions.CLEAR, payload: formID};
};
