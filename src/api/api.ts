import { webFetch } from "./initialization";


/** Well Manager React API. */
class WellManagerReactAPI {

  /** Запрос клиентской конфигурации. */
  public async getClientConfig() {
    let configLocation = window.location.pathname;
    if (configLocation.includes('/systems/')) {
      configLocation = configLocation.slice(0, configLocation.indexOf('systems/'))
    }
    if (!configLocation.endsWith('/')) configLocation += '/';
    configLocation += 'clientConfiguration.json';
    return await fetch(configLocation, {credentials: 'include'}).then((res) => res.json());
  }

  /** Запрос списка доступных систем. */
  public async getSystemList() {
    return await webFetch('systemList').then((res) => res.json());
  }
}

export const API = new WellManagerReactAPI();
