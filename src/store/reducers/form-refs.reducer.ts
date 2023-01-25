/* --- Action Types --- */

export enum FormRefsActions {
  SET = 'formRefs/set',
}

/* --- Action Interfaces --- */

interface ActionSet {
  type: FormRefsActions.SET,
  formID: FormID,
  value: any,
}

export type FormRefsAction = ActionSet;

/* --- Init State & Reducer --- */

const init: FormRefs = {};

export const formRefsReducer = (state: FormRefs = init, action: FormRefsAction): FormRefs => {
  switch (action.type) {

    case FormRefsActions.SET: {
      return {...state, [action.formID]: action.value};
    }

    default: return state;
  }
};
