import { FormsAction, FormsActions } from './forms.reducer';


/** Установить состояние форм. */
export const setFormsState = (state: FormsState): FormsAction => {
  return {type: FormsActions.SET, payload: state};
};

/** Установить конкретное поле настроек. */
export const setSettingsField = (formID: FormID, field: string, value: any): FormsAction => {
  return {type: FormsActions.SET_SETTINGS_FIELD, payload: {id: formID, field, value}};
};

/** Очистить состояние форм. */
export const clearForms = (): FormsAction => {
  return {type: FormsActions.CLEAR};
};
