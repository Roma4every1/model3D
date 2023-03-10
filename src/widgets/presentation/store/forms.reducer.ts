/* --- Action Types --- */

export enum FormsActions {
  SET = 'forms/dict',
  SET_SETTINGS_FIELD = 'forms/field',
  CLEAR = 'forms/clear',
}

/* --- Action Interfaces --- */

interface ActionSetDict {
  type: FormsActions.SET,
  payload: FormsState,
}
interface ActionSetSettingsField {
  type: FormsActions.SET_SETTINGS_FIELD,
  payload: {id: FormID, field: string, value: any},
}
interface ActionClear {
  type: FormsActions.CLEAR,
}

export type FormsAction = ActionSetDict | ActionSetSettingsField | ActionClear;

/* --- Init State & Reducer --- */

const init: FormsState = {};

export const formsReducer = (state: FormsState = init, action: FormsAction): FormsState => {
  switch (action.type) {

    case FormsActions.SET: {
      return {...state, ...action.payload};
    }

    case FormsActions.SET_SETTINGS_FIELD: {
      const { id, field, value } = action.payload;
      const newSettings = {...state[id].settings, [field]: value};
      return {...state, [id]: {...state[id], settings: newSettings}};
    }

    case FormsActions.CLEAR: {
      return {};
    }

    default: return state;
  }
};
