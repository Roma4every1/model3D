import { Dispatch } from 'redux';
import { API } from 'shared/lib';
import { createClientConfig, getAppLocation } from '../../lib/initialization';
import { setInitResult } from './app.actions';


export async function initialize(dispatch: Dispatch) {
  const resConfig = await getClientConfig();
  const config = createClientConfig(resConfig);

  API.setBase(config.webServicesURL);
  API.setRoot(config.root);

  const systemList = await getSystemList();
  dispatch(setInitResult(config, systemList));
}

/** Запрос клиентской конфигурации. */
async function getClientConfig(): Promise<unknown> {
  const configLocation = getAppLocation() + 'clientConfiguration.json';
  try {
    const res = await fetch(configLocation, {credentials: 'include'});
    return await res.json();
  }
  catch (e) {
    return null;
  }
}

/** Запрос списка доступных систем. */
async function getSystemList(): Promise<SystemWMR[] | null> {
  const { ok, data } = await API.request<any[]>({path: 'systemList'});
  return ok && Array.isArray(data)
    ? data.map((rawSystem) => ({id: rawSystem['Name'], ...rawSystem['Attributes']}))
    : null;
}
