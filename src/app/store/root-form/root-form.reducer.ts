/* --- Action Types --- */

export enum RootFormActionType {
  SET = 'root/set',
  SET_ACTIVE_CHILD_ID = 'root/select',
  SET_PRESENTATION_TREE = 'root/visibility',
  SET_LEFT_LAYOUT = 'root/layout',
}

/* --- Action Interfaces --- */

interface ActionSetRoot {
  type: RootFormActionType.SET,
  payload: RootFormState,
}
interface ActionSetActiveChildID {
  type: RootFormActionType.SET_ACTIVE_CHILD_ID,
  payload: FormID,
}
interface ActionSetPresentationTree {
  type: RootFormActionType.SET_PRESENTATION_TREE,
  payload: PresentationTree,
}
interface ActionSetLeftTabHeight {
  type: RootFormActionType.SET_LEFT_LAYOUT,
  payload: LeftPanelLayout,
}

export type RootFormAction = ActionSetRoot | ActionSetActiveChildID | ActionSetPresentationTree |
  ActionSetLeftTabHeight;

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

    case RootFormActionType.SET: {
      const newState = action.payload;
      setActive(newState.presentationTree, newState.activeChildID);
      return newState;
    }

    case RootFormActionType.SET_ACTIVE_CHILD_ID: {
      return {...state, activeChildID: action.payload};
    }

    case RootFormActionType.SET_PRESENTATION_TREE: {
      return {...state, presentationTree: action.payload};
    }

    case RootFormActionType.SET_LEFT_LAYOUT: {
      return {...state, layout: {...state.layout, left: action.payload}};
    }

    default: return state;
  }
};

/**
 * Находит в дереве нужный элемент и выделяет его.
 * Делает все вкладки в которых находится элемент раскрытыми.
 * */
function setActive(tree: PresentationTree, activeID: FormID) {
  for (const item of tree) {
    if (item.items) {
      if (setActive(item.items, activeID)) { item.expanded = true; return; }
    } else if (item.id === activeID) {
      item.selected = true;
      return true;
    }
  }
}
