/** По конфигу устанавливает значение для ссылки на службу запросов. */
export function createClientConfig(data: unknown): ClientConfiguration {
  const config: ClientConfiguration = {
    devMode: false, webServicesURL: '',
    root: getAppLocation(),
  };

  if (data instanceof Object) {
    const apiPrefix = data['webServicesURL'];
    if (typeof apiPrefix === 'string') config.webServicesURL = apiPrefix;
    const devMode = data['devMode'];
    if (typeof devMode === 'boolean') config.devMode = devMode;

    const devDocLink = data['devDocLink'];
    if (typeof devDocLink === 'string') config.devDocLink = devDocLink;
    const userDocLink = data['userDocLink'];
    if (typeof userDocLink === 'string') config.userDocLink = userDocLink;
    const contactEmail = data['contactEmail'];
    if (typeof contactEmail === 'string') config.contactEmail = contactEmail;
  }

  if (config.webServicesURL.length === 0) {
    let pathName = window.location.pathname.slice(1);
    if (pathName.includes('/')) {
      pathName = pathName.slice(0, pathName.indexOf('/'));
    }
    config.webServicesURL = window.location.origin + '/' + pathName + '/WebRequests.svc/';
  } else if (!config.webServicesURL.endsWith('/')) {
    config.webServicesURL += '/';
  }

  return config;
}

/** Определяет расположение клиента относительно корневого пути.
 * @example
 * "/" => "/"
 * "/id3x/client/index.html" => "/id3x/client/"
 * "/id3x/client/systems/" => "/id3x/client/"
 * "/id3x/client/systems/SYSTEM/" => "/id3x/client/"
 * */
export function getAppLocation(): string {
  let location = window.location.pathname;
  if (location.endsWith('index.html')) {
    location = location.substring(0, location.length - 10);
  }
  if (location.includes('/systems/')) {
    location = location.substring(0, location.indexOf('systems/'))
  }
  if (!location.endsWith('/')) location += '/';
  return location;
}
