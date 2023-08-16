import { IJsonModel } from 'flexlayout-react';
import { getChildrenTypes } from '../lib/utils';

/* --- Action Types --- */

export enum PresentationActionType {
  SET = 'presentations/set',
  SET_LAYOUT = 'presentations/layout',
  SET_CHILDREN = 'presentations/children',
  SET_ACTIVE_FORM = 'presentations/active',
  CLEAR = 'presentations/clear',
}

/* --- Action Interfaces --- */

interface ActionSet {
  type: PresentationActionType.SET,
  payload: PresentationState,
}
interface ActionSetLayout {
  type: PresentationActionType.SET_LAYOUT,
  payload: {id: FormID, layout: IJsonModel},
}
interface ActionSetChildren {
  type: PresentationActionType.SET_CHILDREN,
  payload: {id: FormID, children: FormDataWMR[]},
}
interface ActionSetActiveForm {
  type: PresentationActionType.SET_ACTIVE_FORM,
  payload: {id: FormID, activeChildID: FormID},
}
interface ActionClear {
  type: PresentationActionType.CLEAR,
}

export type PresentationAction = ActionSet | ActionSetLayout |
  ActionSetChildren | ActionSetActiveForm | ActionClear;

/* --- Init State & Reducer --- */

const init: PresentationDict = {};

export function presentationsReducer(state: PresentationDict = init, action: PresentationAction): PresentationDict {
  switch (action.type) {

    case PresentationActionType.SET: {
      return {...state, [action.payload.id]: action.payload};
    }

    case PresentationActionType.SET_LAYOUT: {
      const { id, layout } = action.payload;
      return {...state, [id]: {...state[id], layout}};
    }

    case PresentationActionType.SET_CHILDREN: {
      const { id, children } = action.payload;
      const openedChildren = children.map((child) => child.id);
      const childrenTypes = getChildrenTypes(children, openedChildren);
      const activeChildID = children[0]?.id;
      return {...state, [id]: {...state[id], children, openedChildren, activeChildID, childrenTypes}};
    }

    case PresentationActionType.SET_ACTIVE_FORM: {
      const { id, activeChildID } = action.payload;
      return {...state, [id]: {...state[id], activeChildID}};
    }

    case PresentationActionType.CLEAR: {
      return {};
    }

    default: return state;
  }
}
