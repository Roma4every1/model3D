/* --- Action Types --- */

export enum FormsActions {
  SET = 'forms/set',
  SET_DICT = 'forms/dict',
  SET_SETTINGS = 'forms/settings',
  SET_SETTINGS_FIELD = 'forms/field',
}

/* --- Action Interfaces --- */

interface ActionSet {
  type: FormsActions.SET,
  payload: FormState,
}
interface ActionSetDict {
  type: FormsActions.SET_DICT,
  payload: FormsState,
}
interface ActionSetSettings {
  type: FormsActions.SET_SETTINGS,
  payload: {id: FormID, settings: FormSettings},
}
interface ActionSetSettingsField {
  type: FormsActions.SET_SETTINGS_FIELD,
  payload: {id: FormID, field: string, value: any},
}

export type FormsAction = ActionSet | ActionSetDict | ActionSetSettings | ActionSetSettingsField;

/* --- Init State & Reducer --- */

const init: FormsState = {};

export const formsReducer = (state: FormsState = init, action: FormsAction): FormsState => {
  switch (action.type) {

    case FormsActions.SET: {
      const formState = action.payload;
      return {...state, [formState.id]: formState};
    }

    case FormsActions.SET_DICT: {
      return {...state, ...action.payload};
    }

    case FormsActions.SET_SETTINGS: {
      const { id, settings } = action.payload;
      return {...state, [id]: {...state[id], settings}};
    }

    case FormsActions.SET_SETTINGS_FIELD: {
      const { id, field, value } = action.payload;
      const newSettings = {...state[id].settings, [field]: value};
      return {...state, [id]: {...state[id], settings: newSettings}};
    }

    default: return state;
  }
};
