/* --- actions types --- */

export enum ChildFormsActions {
  SET = 'childForms/set',
  SET_OPENED = 'childForms/setOpened',
  SET_ACTIVE = 'childForms/setActive',
}

/* --- actions interfaces --- */

interface ActionSet {
  type: ChildFormsActions.SET,
  formID: FormID,
  payload: FormChildrenState,
}
interface ActionSetOpened {
  type: ChildFormsActions.SET_OPENED,
  formID: FormID,
  payload: OpenedChildrenList,
}
interface ActionSetActive {
  type: ChildFormsActions.SET_ACTIVE,
  formID: FormID,
  payload: ActiveChildrenList,
}

export type ChildFormsAction = ActionSet | ActionSetOpened | ActionSetActive;

/* --- reducer --- */

const init: ChildForms = {};

export const childFormsReducer = (state: ChildForms = init, action: ChildFormsAction): ChildForms => {
  switch (action.type) {

    case ChildFormsActions.SET: {
      return {...state, [action.formID]: action.payload};
    }

    case ChildFormsActions.SET_OPENED: {
      state[action.formID] = {...state[action.formID], openedChildren: action.payload};
      return {...state};
    }

    case ChildFormsActions.SET_ACTIVE: {
      state[action.formID] = {...state[action.formID], activeChildren: action.payload};
      return {...state};
    }

    default: return state;
  }
}
