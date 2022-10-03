import { MapsAPI } from "./maps-api";


interface IRequester {
  request<Expected>(req: WRequest): Promise<Expected | string>
}

interface IWellManagerReactAPI {
  readonly maps: MapsAPI;

  setBase(base: string): void
  request<Expected>(req: WRequest): Promise<Expected | string>
}


const toJSON = (res: Response) => res.json();
const toText = (res: Response) => res.text();


export class Requester implements IRequester {
  constructor(public base: string) {}

  public static resMapDict = {'json': toJSON, 'text': toText};

  public async request<Expected>(req: WRequest): Promise<Expected | string> {
    try {
      const url = new URL(this.base + req.path);
      if (req.query) url.search = new URLSearchParams(req.query).toString();

      const init: RequestInit = {body: req.body, method: req.method || 'GET', credentials: 'include'};
      const onFulfilled = Requester.resMapDict[req.mapper || 'json'];

      return await fetch(url, init).then(onFulfilled);
    }
    catch (error) {
      console.warn(error);
      return  error instanceof Error ? error.message : 'Unknown error';
    }
  }
}


/** Well Manager React API. */
class WellManagerReactAPI implements IWellManagerReactAPI {
  private readonly requester: Requester;
  readonly maps: MapsAPI;

  constructor() {
    this.requester = new Requester('');
    this.maps = new MapsAPI(this.requester);
  }

  public setBase(base: string) {
    this.requester.base = base;
  }

  public async request<Expected>(req: WRequest): Promise<Expected | string> {
    return this.requester.request<Expected>(req);
  }

  /** Запрос клиентской конфигурации. */
  public async getClientConfig() {
    let configLocation = window.location.pathname;
    if (configLocation.includes('/systems/')) {
      configLocation = configLocation.slice(0, configLocation.indexOf('systems/'))
    }
    if (!configLocation.endsWith('/')) configLocation += '/';
    configLocation += 'clientConfiguration.json';
    return await fetch(configLocation, {credentials: 'include'}).then(toJSON);
  }

  /** Запрос списка доступных систем. */
  public async getSystemList() {
    return await this.request<any[]>({path: 'systemList'});
  }
}

export const API = new WellManagerReactAPI();
