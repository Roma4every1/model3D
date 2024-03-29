import {InclinometryModePlugin} from '../plugins/InclinometryModePlugin/InclinometryModePlugin.ts';
import {ConfigPluginNames} from './constants.ts';

/** Возвращает коллбэк для создания экземпляра класса плагина. */
export const pluginNameToInstanceDict: Record<ConfigPluginNames, (settings: PluginSettingsRaw) => IMapPlugin> = {
  'wellsLinkedClients': (settings: PluginSettingsRaw) =>
    new InclinometryModePlugin(getInclinometryPluginSettings(settings)),
}

/** Приводит данные настроек плагина карты к типизированному формату. */
const getInclinometryPluginSettings = (settings: PluginSettingsRaw) => {
  return ({
    minCircle: +settings["@MinCircle"],
    inclinometryModeOn: settings["@InclinometryModeOn"] === "true"
  } as InclinometryPluginSettings);
};
