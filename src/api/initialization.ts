/** Проверка клиентской конфигурации на корректность. */
const isConfigCorrect = (config: unknown): boolean => {
  return typeof config === 'object' && typeof config['webServicesURL'] === 'string';
}

/** Ссылка на службу веб запросов WMW. */
let webServicesURL = null;

/** По конфигу устанавливает значение для ссылки на службу запросов. */
export const setWebServicesURL = (config: unknown): void => {
  if (isConfigCorrect(config)) {
    let configWebServicesURL = config['webServicesURL'];
    if (!configWebServicesURL.endsWith('/')) configWebServicesURL += '/';
    webServicesURL = configWebServicesURL;
  } else {
    let pathName = window.location.pathname.slice(1);
    if (pathName.includes('/')) {
      pathName = pathName.slice(0, pathName.indexOf('/'));
    }
    webServicesURL = window.location.origin + '/' + pathName + '/WebRequests.svc/';
    console.warn('use default URL for web requests: ' + webServicesURL);
    console.warn('invalid config:\n', config);
  }
};

/** Если в конфиге отсутствует ссылка на статические файлы, добавляет её.  */
export const applyRootLocation = (config: ClientConfiguration): void => {
  if (config.hasOwnProperty('staticURL')) return;
  let location = window.location.pathname;
  if (location.includes('/systems/')) {
    location = location.slice(0, location.indexOf('systems/'))
  }
  if (!location.endsWith('/')) location += '/';
  config['root'] = location;
}

/** Универсальная функция для запросов к серверу. */
export async function webFetch(request: string, params: any = undefined) {
  return await fetch(webServicesURL + request, {credentials: 'include', ...params});
}
