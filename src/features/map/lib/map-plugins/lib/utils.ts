import {ConfigPluginNames} from './constants.ts';
import {
  InclinometryModePlugin
} from '../plugins/inclinometry-mode-plugin/inclinometry-mode-plugin.ts';

/** Возвращает коллбэк для создания экземпляра класса плагина. */
export const pluginNameToInstanceDict: Record<ConfigPluginNames, (settings: MapPluginsSettingsDictRaw) => IMapPlugin> = {
  'wellsLinkedClients': (settings: MapPluginsSettingsDictRaw) =>
    new InclinometryModePlugin(getInclinometryPluginSettings(settings)),
}

/** Приводит данные настроек плагина карты к типизированному формату. */
const getInclinometryPluginSettings = (settings: MapPluginsSettingsDictRaw) => {
  return ({
    minCircle: +settings["@MinCircle"],
    inclinometryModeOn: settings["@InclinometryModeOn"] === "true"
  } as InclinometryPluginSettings);
};
