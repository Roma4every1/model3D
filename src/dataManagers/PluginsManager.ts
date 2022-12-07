import { Store } from "redux";
import { FormPluginsSettings, FormPluginSettings } from "../components/dicts/plugins-settings";
import { actions } from "../store";
import { pluginsSettings } from "../components/dicts/plugins-settings";


export default function createPluginsManager(store: Store<WState>) {
  const pluginsConfig: PluginsConfig = {top: [], strip: [], right: [], inner: []};

  for (const formName in pluginsSettings) {
    const formPlugins: FormPluginsSettings = pluginsSettings[formName];

    for (const pluginName in formPlugins) {
      const plugin: FormPluginSettings = formPlugins[pluginName];

      if (!pluginsConfig[formPlugins[pluginName].type]) {
        pluginsConfig[formPlugins[pluginName].type] = [];
      }

      const component = {id: pluginName, form: formName, path: plugin.component};

      if (plugin.type === 'strip' || plugin.type === 'inner') {
        pluginsConfig[plugin.type].push({component});
      } else {
        pluginsConfig[plugin.type].push({
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
  const additive: FormPlugin = {enableDrag: false, type: 'tab', id: 'formStrip', name: '', component: 'strip'};
  pluginsConfig.top.push(additive);

  store.dispatch(actions.setPlugins(pluginsConfig));
}
