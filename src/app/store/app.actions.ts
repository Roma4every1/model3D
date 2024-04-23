import { fetcher } from 'shared/lib';
import { useAppStore } from './app.store';
import { createClientConfig, getAppLocation } from '../lib/initialization';
import { appAPI } from '../lib/app.api';
import { WMDevTools } from './dev-tools';


/** Установить новую систему. */
export function setSystemName(systemID: SystemID): void {
  useAppStore.setState({systemID});
}

/** Установить новый ID сессии. */
export function setSessionID(sessionID: SessionID): void {
  useAppStore.setState({sessionID});
}

/* --- --- */

export async function initialize() {
  const resConfig = await getClientConfig();
  const config = createClientConfig(resConfig);

  fetcher.setPrefix(config.webServicesURL);
  if (config.devMode) window['store'] = new WMDevTools();

  const systemList = await appAPI.getSystemList();
  useAppStore.setState({config, systemList});
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
