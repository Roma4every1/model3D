import { setActive, clearSelect } from '../utils/utils';

/* --- Action Types --- */

export enum RootFormActions {
  SET = 'root/set',
  SELECT_PRESENTATION = 'root/select',
  SET_LEFT_TAB_HEIGHT = 'root/left',
}

/* --- Action Interfaces --- */

interface ActionSetRoot {
  type: RootFormActions.SET,
  payload: Omit<RootFormState, 'layout'>,
}
interface ActionSelectPresentation {
  type: RootFormActions.SELECT_PRESENTATION,
  payload: PresentationTreeItem,
}
interface ActionSetLeftTabHeight {
  type: RootFormActions.SET_LEFT_TAB_HEIGHT,
  payload: {tab: keyof LeftPanelLayout, height: number},
}

export type RootFormAction = ActionSetRoot | ActionSelectPresentation | ActionSetLeftTabHeight;

/* --- Init State & Reducer --- */

const init: RootFormState = {
  id: '',
  settings: {dateChanging: null, parameterGroups: null},
  children: [],
  activeChildID: '',
  presentationTree: [],
  layout: {
    left: {
      globalParamsHeight: 1,
      formParamsHeight: 1,
      treeHeight: 1,
    },
    common: {
      selectedTopTab: -1,   // нет активной вкладки
      selectedRightTab: -1, // нет активной вкладки
      topPanelHeight: 90,
      leftPanelWidth: 270,
      rightPanelWidth: 270,
    },
  },
};

export const rootFormReducer = (state: RootFormState = init, action: RootFormAction): RootFormState => {
  switch (action.type) {

    case RootFormActions.SET: {
      const newState = action.payload;
      setActive(newState.presentationTree, newState.activeChildID);
      return {...newState, layout: state.layout};
    }

    case RootFormActions.SELECT_PRESENTATION: {
      clearSelect(state.presentationTree);
      action.payload.selected = true;
      const presentationsTree = [...state.presentationTree];
      return {...state, presentationTree: presentationsTree, activeChildID: action.payload.id};
    }

    case RootFormActions.SET_LEFT_TAB_HEIGHT: {
      const { tab, height } = action.payload;
      const left: LeftPanelLayout = {...state.layout.left, [tab]: height}
      return {...state, layout: {...state.layout, left}};
    }

    default: return state;
  }
};
