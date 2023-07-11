import { FormsAction, FormsActions } from './forms.reducer';


/** Установить состояние форм. */
export const setFormsState = (state: FormsState): FormsAction => {
  return {type: FormsActions.SET, payload: state};
};

/** Очистить состояние форм. */
export const clearForms = (): FormsAction => {
  return {type: FormsActions.CLEAR};
};
