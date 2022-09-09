/* --- actions types --- */

export enum FormSettingsActions {
  SET = 'formSettings/set',
  SET_SERIES_SETTINGS = 'formSettings/setSeriesSettings',
}

/* --- actions interfaces --- */

interface ActionSet {
  type: FormSettingsActions.SET,
  formId: FormID,
  value: any,
}
interface ActionSetSeriesSetting {
  type: FormSettingsActions.SET_SERIES_SETTINGS,
  payload: {formID: FormID, data: any},
}

export type FormSettingsAction = ActionSet | ActionSetSeriesSetting;

/* --- reducer --- */

const initFormSettings: FormSettings = {};

export const formSettingsReducer = (state: FormSettings = initFormSettings, action: FormSettingsAction): FormSettings => {
  switch (action.type) {

    case FormSettingsActions.SET: {
      return {...state, [action.formId]: action.value};
    }

    case FormSettingsActions.SET_SERIES_SETTINGS: {
      return {
          ...state,
          [action.payload.formID]: {...state[action.payload.formID], seriesSettings: action.payload.data}
      };
    }

    default: return state;
  }
}
