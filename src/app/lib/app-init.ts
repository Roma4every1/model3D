import { fetcher, testString } from 'shared/lib';
import { profileAPI } from 'features/profile';
import { appAPI } from './app.api';
import { useAppStore } from '../store/app.store';
import { WMDevTools } from './dev-tools';
import { getSessionToSave } from './session-save';


/** Инициализация приложения. */
export async function initialize(): Promise<void> {
  const appLocation = useAppStore.getState().location;
  const configObject = await fetchClientConfig(appLocation);
  const config = createClientConfig(configObject);

  fetcher.setPrefix(config.api);
  if (config.geoManager) profileAPI.base = config.geoManager;
  if (config.mode === 'dev') window['store'] = new WMDevTools();

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
  const check = (field: string, matcher?: StringMatcher) => {
    const value = data[field];
    if (typeof value !== 'string' || value.length === 0) return;
    if (!matcher || testString(value, matcher)) config[field] = value;
  };
  const config: ClientConfig = {};

  if (data instanceof Object) {
    check('mode', ['dev', 'production']);
    check('api', /^http/);
    check('geoManager', /^http/);
    check('devDocLink');
    check('userDocLink');
    check('contactEmail');
  }

  if (config.api && !config.api.endsWith('/')) config.api += '/';
  if (config.geoManager && !config.geoManager.endsWith('/')) config.geoManager += '/';

  if (!config.api) config.api = getDefaultPrefix();
  return config;
}

function getDefaultPrefix(): string {
  let pathName = window.location.pathname.slice(1);
  const slashIndex = pathName.indexOf('/');
  if (slashIndex !== -1) pathName = pathName.substring(0, slashIndex);
  return window.location.origin + '/' + pathName + '/WebRequests.svc/';
}
