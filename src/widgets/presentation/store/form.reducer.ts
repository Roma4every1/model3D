/* --- Action Types --- */

export enum FormActionType {
  SET = 'forms/dict',
  CLEAR = 'forms/clear',
}

/* --- Action Interfaces --- */

interface ActionSetDict {
  type: FormActionType.SET,
  payload: FormStates,
}
interface ActionClear {
  type: FormActionType.CLEAR,
}

export type FormAction = ActionSetDict | ActionClear;

/* --- Init State & Reducer --- */

const init: FormStates = {};

export function formsReducer(state: FormStates = init, action: FormAction): FormStates {
  switch (action.type) {

    case FormActionType.SET: {
      return {...state, ...action.payload};
    }

    case FormActionType.CLEAR: {
      return {};
    }

    default: return state;
  }
}
