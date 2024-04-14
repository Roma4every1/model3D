import { Dispatch } from 'redux';
import { StateGetter, fetcher } from 'shared/lib';
import { appAPI } from '../../lib/app.api';
import { createClientConfig, getAppLocation } from '../../lib/initialization';
import { setInitResult } from './app.actions';


export async function initialize(dispatch: Dispatch, getState: StateGetter) {
  const resConfig = await getClientConfig();
  const config = createClientConfig(resConfig);

  if (config.devMode) window['store'] = new WMDevTools(dispatch, getState);
  fetcher.setPrefix(config.webServicesURL);

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

class WMDevTools {
  constructor(
    public readonly dispatch: Dispatch,
    public readonly getState: StateGetter,
  ) {}

  public parameter(id: ParameterID): Parameter | null {
    for (const list of Object.values(this.getState().parameters)) {
      const parameter = list.find(p => p.id === id);
      if (parameter) return parameter;
    }
    return null;
  }

  public parameters(id?: ClientID): Parameter[] {
    const state = this.getState();
    if (!id) id = state.root.id;
    return state.parameters[id];
  }

  public channelRows(name: ChannelName, columns: boolean = false): any[][] | null {
    const channel = this.getState().channels[name];
    if (!channel || !channel.data) return null;
    const rows = channel.data.rows;
    if (columns) rows.unshift(channel.data.columns.map(c => c.name));
    return rows;
  }

  public tables(): TableState[] {
    return Object.values(this.getState().tables);
  }

  public maps(): MapState[] {
    return Object.values(this.getState().maps.single);
  }

  public carats(): CaratState[] {
    return Object.values(this.getState().carats);
  }
}
