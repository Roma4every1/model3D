import { FormsAction, FormsActions } from './forms.reducer';


/** Установить состояние формы. */
export const setFormState = (state: FormState): FormsAction => {
  return {type: FormsActions.SET, payload: state};
};

/** Установить состояние нескольких форм. */
export const setFormsState = (state: FormsState): FormsAction => {
  return {type: FormsActions.SET_DICT, payload: state};
};

/** Установить настройки формы. */
export const setFormSettings = (formID: FormID, settings: FormSettings): FormsAction => {
  return {type: FormsActions.SET_SETTINGS, payload: {id: formID, settings}};
};

/** Установить конкретное поле настроек. */
export const setSettingsField = (formID: FormID, field: string, value: any): FormsAction => {
  return {type: FormsActions.SET_SETTINGS_FIELD, payload: {id: formID, field, value}};
};
