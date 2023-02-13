import { getParentFormId } from 'shared/lib';
import { stringToTableCell } from '../lib/table-row';


/** Параметры конкретной формы; `this - formID`. */
export function formParamsSelector(this: FormID, state: WState): Parameter[] {
  return state.parameters[this];
}

/** Параметр конкретной формы; `this - {formID, id}`. */
export function formParamSelector(this: {formID: FormID, id: ParameterID}, state: WState) {
  const formParams = state.parameters[this.formID];
  return formParams?.find(param => param.id === this.id);
}

/** Значение параметра конкретной формы; `this - {formID, id}`. */
export function formParamValueSelector(this: {formID: FormID, id: ParameterID}, state: WState) {
  const formsParams = state.parameters;
  const findByID = param => param.id === this.id;

  const formParams = formsParams[this.formID];
  const fromForm = formParams?.find(findByID);
  if (fromForm) return fromForm.value;

  const parentParams = formsParams[getParentFormId(this.formID)];
  const fromParent = parentParams?.find(findByID);
  if (fromParent) return fromParent.value;

  return formsParams[state.root.id].find(findByID)?.value;
}

/** ID текущей скважины. */
export function currentWellIDSelector(state: WState): string | null {
  const rootFormParams = state.parameters[state.root.id];
  const currentWellParam = rootFormParams.find((param) => param.id === 'currentWell');
  const value = currentWellParam?.value;
  return value ? stringToTableCell(value as string, 'LOOKUPVALUE') : null;
}
