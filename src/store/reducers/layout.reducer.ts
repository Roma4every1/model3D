import { LeftPanelItems } from "../../layout/left-tabs";


/* --- Actions Types --- */

export enum LayoutActions {
  SET_LEFT_LAYOUT = 'layout/left',
  SET_DOCK_LAYOUT = 'layout/dock',
}

/* --- Actions Interfaces --- */

interface ActionSetLeftLayout {
  type: LayoutActions.SET_LEFT_LAYOUT,
  payload: string[],
}
interface ActionSetDockLayout {
  type: LayoutActions.SET_DOCK_LAYOUT,
  payload: DockLayout,
}

export type LayoutAction = ActionSetLeftLayout | ActionSetDockLayout;

/* --- Reducer --- */

const init: CommonLayout = {
  left: [LeftPanelItems.GLOBAL, LeftPanelItems.FORM, LeftPanelItems.LIST],
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

    case LayoutActions.SET_LEFT_LAYOUT: {
      return {...state, left: action.payload};
    }

    default: return state;
  }
}
