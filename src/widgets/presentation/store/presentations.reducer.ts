import { IJsonModel } from 'flexlayout-react';

/* --- Action Types --- */

export enum PresentationsActions {
  SET = 'presentations/set',
  SET_LAYOUT = 'presentations/layout',
  SET_CHILDREN = 'presentations/children',
  SET_ACTIVE_FORM = 'presentations/active',
  CLEAR = 'presentations/clear',
}

/* --- Action Interfaces --- */

interface ActionSet {
  type: PresentationsActions.SET,
  payload: PresentationState,
}
interface ActionSetLayout {
  type: PresentationsActions.SET_LAYOUT,
  payload: {id: FormID, layout: IJsonModel},
}
interface ActionSetChildren {
  type: PresentationsActions.SET_CHILDREN,
  payload: {id: FormID, children: FormDataWMR[]},
}
interface ActionSetActiveForm {
  type: PresentationsActions.SET_ACTIVE_FORM,
  payload: {id: FormID, activeChildID: FormID},
}
interface ActionClear {
  type: PresentationsActions.CLEAR,
}

export type PresentationsAction = ActionSet | ActionSetLayout |
  ActionSetChildren | ActionSetActiveForm | ActionClear;

/* --- Init State & Reducer --- */

const init: PresentationDict = {};

export const presentationsReducer = (state: PresentationDict = init, action: PresentationsAction): PresentationDict => {
  switch (action.type) {

    case PresentationsActions.SET: {
      return {...state, [action.payload.id]: action.payload};
    }

    case PresentationsActions.SET_LAYOUT: {
      const { id, layout } = action.payload;
      return {...state, [id]: {...state[id], layout}};
    }

    case PresentationsActions.SET_CHILDREN: {
      const { id, children } = action.payload;
      const childrenTypes = new Set(children.map(child => child.type));
      const activeChildID = children[0]?.id;
      return {...state, [id]: {...state[id], children, activeChildID, childrenTypes}};
    }

    case PresentationsActions.SET_ACTIVE_FORM: {
      const { id, activeChildID } = action.payload;
      return {...state, [id]: {...state[id], activeChildID}};
    }

    case PresentationsActions.CLEAR: {
      return {};
    }

    default: return state;
  }
};
