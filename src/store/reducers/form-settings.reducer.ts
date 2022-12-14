/* --- actions types --- */

export enum FormSettingsActions {
  SET = 'formSettings/set',
}

/* --- actions interfaces --- */

interface ActionSet {
  type: FormSettingsActions.SET,
  formId: FormID,
  value: any,
}

export type FormSettingsAction = ActionSet;

/* --- reducer --- */

const initFormSettings: FormsSettings = {};

export const formSettingsReducer = (state: FormsSettings = initFormSettings, action: FormSettingsAction): FormsSettings => {
  switch (action.type) {

    case FormSettingsActions.SET: {
      return {...state, [action.formId]: action.value};
    }

    default: return state;
  }
}
