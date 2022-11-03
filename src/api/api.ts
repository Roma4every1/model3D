import { MapsAPI } from "./maps.api";
import { SessionAPI } from "./session.api";


interface IRequester {
  request<Expected>(req: WRequest): Promise<Res<Expected>>
}
interface IWellManagerReactAPI {
  readonly maps: MapsAPI;
  readonly session: SessionAPI;

  setBase(base: string): void
  setRoot(root: string): void
  request<Expected>(req: WRequest): Promise<Res<Expected>>
}


const toJSON = (res: Response) => res.json();
const toText = (res: Response) => res.text();
const toBLOB = (res: Response) => res.blob();
const toBuffer = (res: Response) => res.arrayBuffer();


export class Requester implements IRequester {
  constructor(public base: string, public root: string) {}

  public static resMapDict = {'json': toJSON, 'text': toText, 'blob': toBLOB, 'buffer': toBuffer};

  public async request<Expected>(req: WRequest): Promise<Res<Expected>> {
    try {
      const url = new URL(this.base + req.path);
      if (req.query) url.search = new URLSearchParams(req.query).toString();

      const init: RequestInit = {body: req.body, method: req.method || 'GET', credentials: 'include'};
      const onFulfilled = Requester.resMapDict[req.mapper || 'json'];
      const response = await fetch(url, init).then(onFulfilled);

      if (response.error) return {ok: false, data: response.message || 'Server side error'};
      return {ok: true, data: response};
    }
    catch (error) {
      console.warn(this.base + req.path);
      console.warn(error);
      return {ok: false, data: error instanceof Error ? error.message : 'Unknown error'};
    }
  }
}


/** Well Manager React API. */
class WellManagerReactAPI implements IWellManagerReactAPI {
  public readonly requester: Requester;
  public readonly maps: MapsAPI;
  public readonly session: SessionAPI;

  constructor() {
    this.requester = new Requester('/', '/');
    this.maps = new MapsAPI(this.requester);
    this.session = new SessionAPI(this.requester);
  }

  public setBase(base: string) {
    this.requester.base = base;
  }
  public setRoot(root: string) {
    this.requester.root = root;
  }

  public async request<Expected>(req: WRequest): Promise<Res<Expected>> {
    return this.requester.request<Expected>(req);
  }

  /** Запрос клиентской конфигурации. */
  public async getClientConfig(): Promise<Res<unknown>> {
    let configLocation = window.location.pathname;
    if (configLocation.includes('/systems/')) {
      configLocation = configLocation.slice(0, configLocation.indexOf('systems/'))
    }
    if (!configLocation.endsWith('/')) configLocation += '/';
    configLocation += 'clientConfiguration.json';

    try {
      const res = await fetch(configLocation, {credentials: 'include'});
      return {ok: true, data: await res.json()}
    }
    catch (e) {
      return {ok: false, data: e.message};
    }
  }

  /** Запрос списка доступных систем. */
  public async getSystemList() {
    return await this.request<any[]>({path: 'systemList'});
  }
}

export const API = new WellManagerReactAPI();
