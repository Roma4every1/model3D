import { LeftPanelItems } from "../../utils/layout.utils";


/* --- Actions Types --- */

export enum LayoutActions {
  SET_PLUGINS = 'layout/plugins',
  SET_LEFT_LAYOUT = 'layout/left'
}

/* --- Actions Interfaces --- */

interface ActionSetPlugins {
  type: LayoutActions.SET_PLUGINS,
  payload: PluginsConfig,
}
interface ActionSetLeftLayout {
  type: LayoutActions.SET_LEFT_LAYOUT,
  payload: string[],
}

export type LayoutAction = ActionSetPlugins | ActionSetLeftLayout;

/* --- Reducer --- */

const init: CommonLayout = {
  plugins: {top: [], strip: [], right: [], inner: []},
  left: [LeftPanelItems.GLOBAL, LeftPanelItems.FORM, LeftPanelItems.LIST],
};

export const layoutReducer = (state: CommonLayout = init, action: LayoutAction): CommonLayout => {
  switch (action.type) {

    case LayoutActions.SET_PLUGINS: {
      return {...state, plugins: action.payload};
    }

    case LayoutActions.SET_LEFT_LAYOUT: {
      return {...state, left: action.payload};
    }

    default: return state;
  }
}
