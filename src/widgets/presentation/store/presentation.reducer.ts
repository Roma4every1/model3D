import { getChildrenTypes } from '../lib/utils';

/* --- Action Types --- */

export enum PresentationActionType {
  SET = 'presentations/set',
  SET_CHILDREN = 'presentations/children',
  SET_ACTIVE_FORM = 'presentations/active',
}

/* --- Action Interfaces --- */

interface ActionSet {
  type: PresentationActionType.SET;
  payload: PresentationState;
}
interface ActionSetChildren {
  type: PresentationActionType.SET_CHILDREN;
  payload: {id: ClientID, children: FormDataWM[]};
}
interface ActionSetActiveForm {
  type: PresentationActionType.SET_ACTIVE_FORM;
  payload: {id: ClientID, activeChildID: FormID};
}

export type PresentationAction = ActionSet | ActionSetChildren | ActionSetActiveForm;

/* --- Init State & Reducer --- */

const init: PresentationDict = {};

export function presentationsReducer(state: PresentationDict = init, action: PresentationAction): PresentationDict {
  switch (action.type) {

    case PresentationActionType.SET: {
      return {...state, [action.payload.id]: action.payload};
    }

    case PresentationActionType.SET_CHILDREN: {
      const { id, children } = action.payload;
      const openedChildren = children.map(child => child.id);
      const childrenTypes = getChildrenTypes(children, openedChildren);
      const activeChildID = children[0]?.id;
      return {...state, [id]: {...state[id], children, openedChildren, activeChildID, childrenTypes}};
    }

    case PresentationActionType.SET_ACTIVE_FORM: {
      const { id, activeChildID } = action.payload;
      return {...state, [id]: {...state[id], activeChildID}};
    }

    default: return state;
  }
}
