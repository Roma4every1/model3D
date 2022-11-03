/** Ссылка на службу веб запросов WMW. */
let webServicesURL = '';

/** По конфигу устанавливает значение для ссылки на службу запросов. */
export function applyConfig(res: Res<unknown>): WResponse<ClientConfiguration> {
  const data = res.data;
  const config: ClientConfiguration = {webServicesURL: '', root: ''};

  if (data instanceof Object) {
    const configURL = data['webServicesURL'];
    if (typeof configURL === 'string') { config.webServicesURL = configURL; webServicesURL = configURL; }
    const root = data['root'];
    if (typeof root === 'string') config.root = root;
  }

  if (config.webServicesURL === '') {
    let pathName = window.location.pathname.slice(1);
    if (pathName.includes('/')) {
      pathName = pathName.slice(0, pathName.indexOf('/'));
    }
    webServicesURL = window.location.origin + '/' + pathName + '/WebRequests.svc/';
    console.warn('use default URL for web requests: ' + webServicesURL);
    console.warn('invalid config:\n', data);
  }
  if (config.root === '') {
    let location = window.location.pathname;
    if (location.includes('/systems/')) {
      location = location.slice(0, location.indexOf('systems/'))
    }
    if (!location.endsWith('/')) location += '/';
    config.root = location;
  }
  return {ok: true, data: config};
}

/** Универсальная функция для запросов к серверу. */
export async function webFetch(request: string, params: any = undefined) {
  return await fetch(webServicesURL + request, {credentials: 'include', ...params});
}
