/* --- Actions Types --- */

export enum LayoutActions {
  SET_DOCK_LAYOUT = 'layout/dock',
  SET_LEFT_TAB_HEIGHT = 'layout/left',
}

/* --- Actions Interfaces --- */

interface ActionSetDockLayout {
  type: LayoutActions.SET_DOCK_LAYOUT,
  payload: DockLayout,
}
interface ActionSetLeftTabHeight {
  type: LayoutActions.SET_LEFT_TAB_HEIGHT,
  payload: {tab: keyof LeftPanelLayout, height: number},
}

export type LayoutAction = ActionSetDockLayout | ActionSetLeftTabHeight;

/* --- Reducer --- */

const init: CommonLayout = {
  left: {
    globalParamsHeight: 1,
    formParamsHeight: 1,
    treeHeight: 1,
  },
  dock: {
    selectedTopTab: -1,   // нет активной вкладки
    selectedRightTab: -1, // нет активной вкладки
    topPanelHeight: 90,
    leftPanelWidth: 270,
    rightPanelWidth: 270,
  },
};

export const layoutReducer = (state: CommonLayout = init, action: LayoutAction): CommonLayout => {
  switch (action.type) {

    case LayoutActions.SET_DOCK_LAYOUT: {
      return {...state, dock: action.payload};
    }

    case LayoutActions.SET_LEFT_TAB_HEIGHT: {
      const { tab, height } = action.payload;
      return {...state, left: {...state.left, [tab]: height}};
    }

    default: return state;
  }
}
