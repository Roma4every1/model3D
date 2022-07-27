import { webFetch } from "../initialization";

/** Делает запрос на получение клиентской конфигурации и возвращает её. */
export const getClientConfig = async () => {
  let configLocation = window.location.pathname;
  if (configLocation.includes('/systems/')) {
    configLocation = configLocation.slice(0, configLocation.indexOf('systems/'))
  }
  if (!configLocation.endsWith('/')) configLocation += '/';
  configLocation += 'clientConfiguration.json';
  return await fetch(configLocation, {credentials: 'include'}).then((res) => res.json());
}

/** Делает запрос на получение списка систем и преобразует полученный результат. */
export const getSystemList = async () => {
  return await webFetch('systemList').then((res) => res.json());
}
