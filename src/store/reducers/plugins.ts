/* --- actions types --- */

export enum PluginsActions {
  SET_PLUGINS = 'layout/setPlugins',
}

/* --- actions interfaces --- */

export interface ActionSet {
  type: PluginsActions.SET_PLUGINS,
  value: any,
}

export type PluginsAction = ActionSet;

/* --- reducer --- */

const initPlugins = [];

export const plugins = (state = initPlugins, action: PluginsAction) => {
  switch (action.type) {

    case PluginsActions.SET_PLUGINS: {
      return action.value;
    }

    default: return state;
  }
}
