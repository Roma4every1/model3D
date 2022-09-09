/* --- actions types --- */

export enum ChildFormsActions {
    SET = 'childForms/set',
    SET_OPENED = 'childForms/setOpened',
    SET_ACTIVE = 'childForms/setActive',
}

/* --- actions interfaces --- */

interface ActionSet {
  type: ChildFormsActions.SET,
  formId: FormID,
  value: any,
}
interface ActionSetOpened {
  type: ChildFormsActions.SET_OPENED,
  formId: FormID,
  values: any,
}
interface ActionSetActive {
  type: ChildFormsActions.SET_ACTIVE,
  formId: FormID,
  values: any,
}

export type ChildFormsAction = ActionSet | ActionSetOpened | ActionSetActive;

/* --- reducer --- */

const initChildForms: ChildForms = {};

export const childFormsReducer = (state: ChildForms = initChildForms, action: ChildFormsAction): ChildForms => {
  switch (action.type) {

    case ChildFormsActions.SET: {
      return {...state, [action.formId]: action.value};
    }

    case ChildFormsActions.SET_OPENED: {
      return {
        ...state,
        [action.formId]: {...state[action.formId], openedChildren: action.values},
      };
    }

    case ChildFormsActions.SET_ACTIVE: {
      return {
        ...state,
        [action.formId]: {...state[action.formId], activeChildren: action.values},
      };
    }

    default: return state;
  }
}
