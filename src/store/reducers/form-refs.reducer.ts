/* --- actions types --- */

export enum FormRefsActions {
  SET = 'formRefs/set',
}

/* --- actions interfaces --- */

interface ActionSet {
  type: FormRefsActions.SET,
  formID: FormID,
  value: any,
}

export type FormRefsAction = ActionSet;

/* --- reducer --- */

const initFormRefs: FormRefs = {};

export const formRefsReducer = (state: FormRefs = initFormRefs, action: FormRefsAction): FormRefs => {
  switch (action.type) {

    case FormRefsActions.SET: {
      return {...state, [action.formID]: action.value};
    }

    default: return state;
  }
}
