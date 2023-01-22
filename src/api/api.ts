import { MapsAPI } from "./maps.api";
import { FormsAPI } from "./forms.api";
import { SessionAPI } from "./session.api";
import { ChannelsAPI } from "./channels.api";
import { ProgramsAPI } from "./programs.api";


interface IWellManagerReactAPI {
  readonly maps: MapsAPI;
  readonly forms: FormsAPI;
  readonly session: SessionAPI;
  readonly channels: ChannelsAPI;
  readonly programs: ProgramsAPI;

  setBase(base: string): void
  setRoot(root: string): void
  setSessionID(sessionID: SessionID): void

  request<Expected>(req: WRequest): Promise<Res<Expected>>
}


export class Requester {
  public base: string;
  public root: string;
  public sessionID: SessionID;

  constructor() {
    this.base = '/';
    this.root = '/';
    this.sessionID = '';
  }

  public static resMapDict = {
    'json': (res: Response) => res.json(),
    'text': (res: Response) => res.text(),
    'blob': (res: Response) => res.blob(),
    'buffer': (res: Response) => res.arrayBuffer(),
  };

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
  public readonly forms: FormsAPI;
  public readonly session: SessionAPI;
  public readonly channels: ChannelsAPI;
  public readonly programs: ProgramsAPI;

  constructor() {
    const requester = new Requester();
    this.requester = requester;

    this.maps = new MapsAPI(requester);
    this.forms = new FormsAPI(requester);
    this.session = new SessionAPI(requester);
    this.channels = new ChannelsAPI(requester);
    this.programs = new ProgramsAPI(requester);
  }

  public setBase(base: string): void {
    this.requester.base = base;
  }
  public setRoot(root: string): void {
    this.requester.root = root;
  }
  public setSessionID(sessionID: SessionID): void {
    this.requester.sessionID = sessionID;
  }

  public async request<Expected>(req: WRequest): Promise<Res<Expected>> {
    return this.requester.request<Expected>(req);
  }

  /** Запрос клиентской конфигурации. */
  public async getClientConfig(): Promise<unknown> {
    let configLocation = window.location.pathname;
    if (configLocation.includes('/systems/')) {
      configLocation = configLocation.slice(0, configLocation.indexOf('systems/'))
    }
    if (!configLocation.endsWith('/')) configLocation += '/';
    configLocation += 'clientConfiguration.json';

    try {
      const res = await fetch(configLocation, {credentials: 'include'});
      return await res.json();
    }
    catch (e) {
      return null;
    }
  }

  /** Запрос списка доступных систем. */
  public async getSystemList() {
    const res = await this.request<any[]>({path: 'systemList'});
    res.ok = res.ok && (res.data instanceof Array)
    return res;
  }

  public async getPresentationsList(rootFormID: FormID): Promise<Res<PresentationItem>> {
    const query = {sessionId: this.requester.sessionID, formId: rootFormID};
    return await this.request<PresentationItem>({path: 'presentationList', query});
  }

  /** Запрос состояния корневой формы. */
  public async getRootFormState(channelManager: ChannelsManager): Promise<RootFormState | string> {
    const resRootForm = await this.forms.getRootForm();
    if (!resRootForm.ok) return 'ошибка при получении id корневой формы';
    const id = resRootForm.data.id;

    const resPresentations = await this.getPresentationsList(id);
    if (!resPresentations.ok) return 'ошибка при получении списка презентаций';
    const presentations = resPresentations.data.items;

    const resChildren = await this.forms.getFormChildren(id);
    if (!resChildren.ok) return 'ошибка при получении списка презентаций';
    const children = resChildren.data;

    const resSettings = await this.getPluginData(id, 'dateChanging');
    const dateChangingRaw = resSettings.data?.dateChanging;

    const dateChanging = dateChangingRaw ? {
      yearParameter: dateChangingRaw['@yearParameter'],
      dateIntervalParameter: dateChangingRaw['@dateIntervalParameter'],
      columnName: dateChangingRaw['@columnNameParameter'] ?? null
    } : null;
    const settings: DockFormSettings = {dateChanging, parameterGroups: null};

    const resParams = await this.forms.getFormParameters(id);
    if (!resParams.ok) return 'ошибка при получении глобальных параметров';
    const parameters = resParams.data;

    for (const param of parameters) {
      param.formID = id;
      if (param['externalChannelName'] && !param.canBeNull) {
        await channelManager.loadAllChannelData(param['externalChannelName'], id, false);
      }
    }
    await channelManager.loadFormChannelsList(id);
    channelManager.setFormInactive(id);

    return {id, settings, children, parameters, presentations};
  }

  public async getPluginData(formID: FormID, pluginName: string) {
    const query = {sessionId: this.requester.sessionID, formId: formID, pluginName};
    return await this.request<any>({path: 'pluginData', query});
  }

  public async exportToExcel(data: any) {
    data.sessionId = this.requester.sessionID;
    const body = JSON.stringify(data);
    return await this.request<any>({method: 'POST', path: 'exportToExcel', body});
  }

  public async uploadFile(fileName: string, data: string | ArrayBuffer) {
    const query = {sessionId: this.requester.sessionID, filename: fileName};
    return await this.request<any>({method: 'POST', path: 'uploadFile', query, body: data});
  }

  public async downloadFile(resourceName: string) {
    const query = {sessionId: this.requester.sessionID, resourceName};
    return await this.request<Blob>({path: 'downloadResource', query, mapper: 'blob'});
  }
}

export const API = new WellManagerReactAPI();
