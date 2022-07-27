/**
 * Стандартная URL для взаимодействия с сервером; используется если:
 * + URL из клиенской конфигурации некорректный
 * + содержимое клиентской конфигурации некорректно в целом
 * + не удалось получить клиентсную конфигурацию
 * @example
 * "http://gs-wp51:81/WellManager.ServerSide.Site/WebRequests.svc/" // С демо системой
 * "http://kmn-wmw:8080/bk1a/WebRequests.svc/" // Калининградские системы
 * "http://wmw-usi/id2x/WebRequests.svc/" // Коми
 * */
const defaultURL = 'http://wmw-usi/id2x/WebRequests.svc/';

/** Проверка клиентской конфигурации на корректность. */
const checkClientConfig = (config) => {
  return typeof config === 'object' && config.hasOwnProperty('webServicesURL');
}

/** Ссылка на службу веб запросов WMW. */
let webServicesURL = null;

/** По конфигу устанавливает значение для ссылки на службу запросов. */
export const setWebServicesURL = (config) => {
  if (checkClientConfig(config)) {
    let configWebServicesURL = config['webServicesURL'];
    if (!configWebServicesURL.endsWith('/')) configWebServicesURL += '/';
    webServicesURL = configWebServicesURL;
  } else {
    webServicesURL = defaultURL;
    console.warn('use default URL for web requests: ' + defaultURL);
    console.warn('invalid config:\n', config);
  }
};

/** Если в конфиге отсутствует ссылка на статические файлы, добавляет её.  */
export const applyRootLocation = (config) => {
  if (config.hasOwnProperty('staticURL')) return;
  let location = window.location.pathname;
  if (location.includes('/systems/')) {
    location = location.slice(0, location.indexOf('systems/'))
  }
  if (!location.endsWith('/')) location += '/';
  config['root'] = location;
}

/** Универсальная функция для запросов к серверу. */
export async function webFetch(request, params) {
  return await fetch(webServicesURL + request, {credentials: 'include', ...params});
}
