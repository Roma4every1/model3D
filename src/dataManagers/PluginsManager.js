import setPlugins from "../store/actionCreators/setPlugins";
import pluginsSettings from "./pluginsSettings.json";

export default function createPluginsManager(store) {

    const configToSave = { top: [] };
    configToSave.strip = [];

    for (var formName in pluginsSettings) {
        for (var pluginName in pluginsSettings[formName]) {
            if (!configToSave[pluginsSettings[formName][pluginName].type]) {
                configToSave[pluginsSettings[formName][pluginName].type] = [];
            }
            if (pluginsSettings[formName][pluginName].type === "strip") {
                configToSave.strip.push({
                    "component": {
                        "id": pluginName,
                        "form": formName,
                        "path": pluginsSettings[formName][pluginName].component
                    }
                })
            }
            else {
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
    }

    configToSave.top.push({
        "enableDrag": false,
        "type": "tab",
        "id": "formStrip",
        "name": "test",
        "component": "strip"
    })

    store.dispatch(setPlugins(configToSave));
}
