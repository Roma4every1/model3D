import { FormAction, FormActionType } from './form.reducer';


/** Установить состояние форм. */
export function setFormsState(state: FormStates): FormAction {
  return {type: FormActionType.SET, payload: state};
}

/** Очистить состояние форм. */
export function clearForms(): FormAction {
  return {type: FormActionType.CLEAR};
}
