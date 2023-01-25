import { IJsonModel } from 'flexlayout-react';

/* --- Action Types --- */

export enum FormLayoutActions {
  SET = 'formLayout/set',
}

/* --- Action Interfaces --- */

interface ActionSet {
  type: FormLayoutActions.SET,
  formID: FormID,
  payload: IJsonModel,
}

export type FormLayoutAction = ActionSet;

/* --- Init State & Reducer --- */

const init: FormsLayout = {};

export const formLayoutReducer = (state: FormsLayout = init, action: FormLayoutAction): FormsLayout => {
  switch (action.type) {

    case FormLayoutActions.SET: {
      return {...state, [action.formID]: action.payload};
    }

    default: return state;
  }
};
