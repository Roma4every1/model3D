import { Dispatch } from 'redux';
import { StateGetter, API } from 'shared/lib';
import { appAPI } from '../../lib/app.api';
import { createClientConfig, getAppLocation } from '../../lib/initialization';
import { setInitResult } from './app.actions';


export async function initialize(dispatch: Dispatch, getState: StateGetter) {
  const resConfig = await getClientConfig();
  const config = createClientConfig(resConfig);

  if (config.devMode) initializeDevTools(dispatch, getState);
  API.setBase(config.webServicesURL);
  API.setRoot(config.root);

  const systemList = await appAPI.getSystemList();
  dispatch(setInitResult(config, systemList));
}

/** Запрос клиентской конфигурации. */
async function getClientConfig(): Promise<unknown> {
  const configLocation = getAppLocation() + 'client-configuration.json';
  try {
    const res = await fetch(configLocation, {credentials: 'include'});
    return await res.json();
  }
  catch {
    return null;
  }
}

/** Инициализация инструментов разработчика. */
function initializeDevTools(dispatch: Dispatch, getState: StateGetter): void {
  window['store'] = {dispatch, getState};
}
