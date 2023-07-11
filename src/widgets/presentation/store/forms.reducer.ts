/* --- Action Types --- */

export enum FormsActions {
  SET = 'forms/dict',
  CLEAR = 'forms/clear',
}

/* --- Action Interfaces --- */

interface ActionSetDict {
  type: FormsActions.SET,
  payload: FormsState,
}
interface ActionClear {
  type: FormsActions.CLEAR,
}

export type FormsAction = ActionSetDict | ActionClear;

/* --- Init State & Reducer --- */

const init: FormsState = {};

export const formsReducer = (state: FormsState = init, action: FormsAction): FormsState => {
  switch (action.type) {

    case FormsActions.SET: {
      return {...state, ...action.payload};
    }

    case FormsActions.CLEAR: {
      return {};
    }

    default: return state;
  }
};
