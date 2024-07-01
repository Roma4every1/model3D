import { fetcher } from 'shared/lib';
import { appAPI } from './app.api';
import { useAppStore } from '../store/app.store';
import { WMDevTools } from './dev-tools';
import { getSessionToSave } from './session-save';


/** Инициализация приложения. */
export async function initialize(): Promise<void> {
  const appLocation = useAppStore.getState().location;
  const configObject = await fetchClientConfig(appLocation);
  const config = createClientConfig(configObject);

  fetcher.setPrefix(config.webServicesURL);
  if (config.devMode) window['store'] = new WMDevTools();

  const systemList = await appAPI.getSystemList();
  useAppStore.setState({config, systemList, loading: {step: 'wait'}});

  const beforeUnload = () => appAPI.stopSession(getSessionToSave()).then();
  window.addEventListener('beforeunload', beforeUnload);
}

async function fetchClientConfig(appLocation: string): Promise<unknown> {
  try {
    const configLocation = appLocation + 'client-configuration.json';
    const res = await fetch(configLocation, {credentials: 'include'});
    return await res.json();
  } catch {
    return null;
  }
}

function createClientConfig(data: unknown): ClientConfig {
  const config: ClientConfig = {devMode: false, webServicesURL: ''};

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
