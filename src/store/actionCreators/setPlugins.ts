import {ActionSet, PluginsActions} from "../reducers/plugins";


const setPlugins = (value): ActionSet => {
  return {type: PluginsActions.SET_PLUGINS, value};
}

export default setPlugins;
