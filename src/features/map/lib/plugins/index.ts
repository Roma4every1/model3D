import { InclinometryPlugin } from './inclinometry.plugin';


/** Словарь плагинов карты. */
export const mapPluginDict = {
  wellsLinkedClients: InclinometryPlugin,
};

export interface MapPluginTypeMap {
  'incl': InclinometryPlugin;
}

export { InclinometryPlugin };
