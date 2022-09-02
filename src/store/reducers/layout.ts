/* --- actions types --- */

export enum LayoutActions {
  SET = 'layout/set',
  SET_PLUGINS = 'layout/plugins',
  SET_TOP_SIZE = 'layout/top',
}

/* --- actions interfaces --- */

interface ActionSet {
  type: LayoutActions.SET,
  formID: FormID,
  payload: any,
}
interface ActionSetPlugins {
  type: LayoutActions.SET_PLUGINS,
  payload: any,
}
interface ActionSetTopBorder {
  type: LayoutActions.SET_TOP_SIZE,
  payload: number,
}

export type LayoutAction = ActionSet | ActionSetPlugins | ActionSetTopBorder;

/* --- reducer --- */

const initLayout: FormsLayout = {
  plugins: null,
  topSize: 40,
};

export const layoutReducer = (state: FormsLayout = initLayout, action: LayoutAction): FormsLayout => {
  switch (action.type) {

    case LayoutActions.SET: {
      return {...state, [action.formID]: action.payload};
    }

    case LayoutActions.SET_PLUGINS: {
      return {...state, plugins: action.payload};
    }

    case LayoutActions.SET_TOP_SIZE: {
      return {...state, topSize: action.payload};
    }

    default: return state;
  }
}
