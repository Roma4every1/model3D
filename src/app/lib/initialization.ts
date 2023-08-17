/** По конфигу устанавливает значение для ссылки на службу запросов. */
export function createClientConfig(data: unknown): ClientConfiguration {
  const config: ClientConfiguration = {
    devMode: false, webServicesURL: '',
    root: getAppLocation(),
  };

  if (data instanceof Object) {
    const configURL = data['webServicesURL'];
    if (typeof configURL === 'string') config.webServicesURL = configURL;
    const devMode = data['devMode'];
    if (typeof devMode === 'boolean') config.devMode = devMode;
  }

  if (config.webServicesURL.length === 0) {
    let pathName = window.location.pathname.slice(1);
    if (pathName.includes('/')) {
      pathName = pathName.slice(0, pathName.indexOf('/'));
    }
    const webServicesURL = window.location.origin + '/' + pathName + '/WebRequests.svc/';
    console.warn('use default URL for web requests: ' + webServicesURL);
    console.warn('invalid config:\n', data);
    config.webServicesURL = webServicesURL;
  }

  return config;
}

export function getAppLocation(): string {
  let location = window.location.pathname;
  if (location.includes('/systems/')) {
    location = location.slice(0, location.indexOf('systems/'))
  }
  if (!location.endsWith('/')) location += '/';
  return location;
}
