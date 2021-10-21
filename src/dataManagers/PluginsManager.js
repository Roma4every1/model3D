import setPlugins from "../store/actionCreators/setPlugins";
import pluginsSettings from "./pluginsSettings.json";

export default function createPluginsManager(store) {

    const configToSave = {};

    for (var formName in pluginsSettings) {
        for (var pluginName in pluginsSettings[formName]) {
            if (!configToSave[pluginsSettings[formName][pluginName].type]) {
                configToSave[pluginsSettings[formName][pluginName].type] = [];
            }
            configToSave[pluginsSettings[formName][pluginName].type].push({
                "enableDrag": false,
                "type": "tab",
                "name": pluginsSettings[formName][pluginName].label,
                "component": {
                    "id": pluginName,
                    "form": formName,
                    "path": pluginsSettings[formName][pluginName].component
                }
            })
        }
    }

    store.dispatch(setPlugins(configToSave));
}