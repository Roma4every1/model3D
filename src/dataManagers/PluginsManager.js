import pluginsSettings from "./pluginsSettings.json";
import { actions } from "../store";


export default function createPluginsManager(store) {
  const configToSave = {top: [], strip: []};

  for (const formName in pluginsSettings) {
    const formPlugins = pluginsSettings[formName];

    for (const pluginName in formPlugins) {
      const plugin = formPlugins[pluginName];

      if (!configToSave[formPlugins[pluginName].type]) {
        configToSave[formPlugins[pluginName].type] = [];
      }

      const component = {id: pluginName, form: formName, path: plugin.component};

      if (plugin.type === 'strip' || plugin.type === 'inner') {
        configToSave[plugin.type].push({component});
      } else if (plugin.type === 'left') {
        configToSave[plugin.type].push({
          type: 'tabset',
          order: plugin.order,
          WMWname: plugin.WMWname,
          selected: 0,
          weight: plugin.weight,
          condition: plugin.condition,
          children: [{enableDrag: true, type: 'tab', name: plugin.label, component}]
        });
      } else {
        configToSave[plugin.type].push({
          enableDrag: false,
          type: 'tab',
          name: plugin.label,
          id: pluginName,
          component,
        });
      }
    }
  }

  // Для некоторых форм сверху предусмотрена панель управления (таблица, карта, график).
  const additive = {enableDrag: false, type: 'tab', id: 'formStrip', name: '', component: 'strip'};
  configToSave.top.push(additive);

  store.dispatch(actions.setPlugins(configToSave));
}
