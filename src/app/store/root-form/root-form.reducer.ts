import { setActive, clearSelect } from './utils';

/* --- Action Types --- */

export enum RootFormActions {
  SET = 'root/set',
  SELECT_PRESENTATION = 'root/select',
  SET_LEFT_LAYOUT = 'root/layout',
}

/* --- Action Interfaces --- */

interface ActionSetRoot {
  type: RootFormActions.SET,
  payload: RootFormState,
}
interface ActionSelectPresentation {
  type: RootFormActions.SELECT_PRESENTATION,
  payload: PresentationTreeItem,
}
interface ActionSetLeftTabHeight {
  type: RootFormActions.SET_LEFT_LAYOUT,
  payload: LeftPanelLayout,
}

export type RootFormAction = ActionSetRoot | ActionSelectPresentation | ActionSetLeftTabHeight;

/* --- Init State & Reducer --- */

const init: RootFormState = {
  id: '',
  settings: {dateChanging: null, parameterGroups: null},
  children: [],
  activeChildID: '',
  presentationTree: [],
  layout: null,
};

export const rootFormReducer = (state: RootFormState = init, action: RootFormAction): RootFormState => {
  switch (action.type) {

    case RootFormActions.SET: {
      const newState = action.payload;
      setActive(newState.presentationTree, newState.activeChildID);
      return newState;
    }

    case RootFormActions.SELECT_PRESENTATION: {
      clearSelect(state.presentationTree);
      action.payload.selected = true;
      const presentationsTree = [...state.presentationTree];
      return {...state, presentationTree: presentationsTree, activeChildID: action.payload.id};
    }

    case RootFormActions.SET_LEFT_LAYOUT: {
      return {...state, layout: {...state.layout, left: action.payload}};
    }

    default: return state;
  }
};
