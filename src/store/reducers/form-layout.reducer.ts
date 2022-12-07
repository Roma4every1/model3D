/* --- Actions Types --- */

export enum FormLayoutActions {
  SET = 'formLayout/set',
}

/* --- Actions Interfaces --- */

interface ActionSet {
  type: FormLayoutActions.SET,
  formID: FormID,
  payload: FormLayout,
}

export type FormLayoutAction = ActionSet;

/* --- Reducer --- */

export const formLayoutReducer = (state: FormsLayout = {}, action: FormLayoutAction): FormsLayout => {
  switch (action.type) {

    case FormLayoutActions.SET: {
      return {...state, [action.formID]: action.payload};
    }

    default: return state;
  }
}
