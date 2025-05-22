import { fetcher, testString } from 'shared/lib';
import { useGlobalStore } from 'shared/global';
import { appAPI } from './app.api';
import { useAppStore } from '../store/app.store';
import { WMDevTools } from './dev-tools';
import { getSessionToSave } from './session-save';


/** Инициализация приложения. */
export async function initialize(): Promise<void> {
  checkJS();
  const { location, instanceController } = useAppStore.getState();
  const configObject = await fetchClientConfig(location);
  const appConfig = createAppConfig(configObject);

  fetcher.setPrefix(appConfig.api);
  if (appConfig.mode === 'dev') window['store'] = new WMDevTools();

  const systemList = await appAPI.getSystemList();
  useGlobalStore.setState({config: appConfig});
  useAppStore.setState({systemList, loading: {step: 'wait'}});

  const beforeUnload = () => {
    if (instanceController.main) {
      instanceController.destroy();
      appAPI.stopSession(getSessionToSave());
    } else {
      appAPI.stopSession();
    }
  };
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

function createAppConfig(data: unknown): AppConfig {
  const check = (field: string, matcher?: StringMatcher) => {
    const value = data[field];
    if (typeof value !== 'string' || value.length === 0) return;
    if (!matcher || testString(value, matcher)) config[field] = value;
  };
  const config: AppConfig = {};

  if (data instanceof Object) {
    check('mode', ['dev', 'production']);
    check('api', /^http/);
    check('devDocLink');
    check('userDocLink');
    check('contactEmail');
  }
  if (config.api) {
    if (!config.api.endsWith('/')) config.api += '/';
  } else {
    config.api = getDefaultPrefix();
  }
  return config;
}

function getDefaultPrefix(): string {
  let pathName = window.location.pathname.slice(1);
  const slashIndex = pathName.indexOf('/');
  if (slashIndex !== -1) pathName = pathName.substring(0, slashIndex);
  return window.location.origin + '/' + pathName + '/WebRequests.svc/';
}

function checkJS(): void {
  if (!Promise.withResolvers) Promise.withResolvers = function(): PromiseWithResolvers<any> {
    let resolve: (value: any) => void
    let reject: (reason: any) => void;
    const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
    return {promise, resolve, reject};
  };
  if (!Array.prototype.toSorted) Array.prototype.toSorted = function(compareFn): any[] {
    return [...this].sort(compareFn);
  };
}
