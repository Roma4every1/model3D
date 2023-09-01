/* --- Action Types --- */

export enum FormActionType {
  SET = 'forms/dict',
}

/* --- Action Interfaces --- */

interface ActionSetDict {
  type: FormActionType.SET;
  payload: FormStates;
}

export type FormAction = ActionSetDict;

/* --- Init State & Reducer --- */

const init: FormStates = {};

export function formsReducer(state: FormStates = init, action: FormAction): FormStates {
  switch (action.type) {

    case FormActionType.SET: {
      return {...state, ...action.payload};
    }

    default: return state;
  }
}
