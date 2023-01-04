/* --- Actions Types --- */

export enum FormSettingsActions {
  SET = 'formSettings/set',
  SET_FIELD = 'formSettings/setField',
}

/* --- Actions Interfaces --- */

interface ActionSet {
  type: FormSettingsActions.SET,
  formID: FormID,
  value: FormSettings,
}
interface ActionSetField {
  type: FormSettingsActions.SET_FIELD,
  formID: FormID,
  field: string,
  value: any,
}

export type FormSettingsAction = ActionSet | ActionSetField;

/* --- Reducer --- */

export const formSettingsReducer = (state: FormsSettings = {}, action: FormSettingsAction): FormsSettings => {
  switch (action.type) {

    case FormSettingsActions.SET: {
      return {...state, [action.formID]: action.value};
    }

    case FormSettingsActions.SET_FIELD: {
      state[action.formID] = {...state[action.formID], [action.field]: action.value};
      return {...state};
    }

    default: return state;
  }
}
