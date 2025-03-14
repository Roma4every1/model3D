import type { Res, ReqOptions, XRawElement } from 'shared/lib';
import type { IJsonModel } from 'flexlayout-react';
import type { ParameterInit } from 'entities/parameter';
import { Fetcher, fetcher } from 'shared/lib';
import { serializeParameter } from 'entities/parameter';


export interface ClientDataDTO<S = any> {
  settings: S;
  channels: AttachedChannelDTO[];
  parameters: ParameterInit[];
  children?: ClientChildrenDTO;
  layout?: IJsonModel;
  extra?: XRawElement;
}
export interface ParameterSetterDTO {
  parameterToSet: string;
  parametersToExecute: string[];
  index: number;
}


export class ClientAPI {
  constructor(private readonly api: Fetcher) {}

  public getClientData(id: ClientID, type: ClientType): Promise<Res<ClientDataDTO>> {
    if (this.api.legacy) {
      if (this.api.version) {
        if (type === 'map') {
          return this.getMapClientDataLegacy(id);
        } else {
          return this.api.get('/getAllForForm', {query: {formId: id}});
        }
      } else {
        if (type === 'dock') {
          return this.getRootDataLegacy(id);
        } else if (type === 'grid') {
          return this.getPresentationDataLegacy(id);
        } else {
          return this.getFormDataLegacy(id, type);
        }
      }
    } else {
      return this.api.get('/client/' + id);
    }
  }

  /** Выполнение привязанного свойства презентации. */
  public async executeLinkedProperty(id: ClientID, params: Parameter[], index: number): Promise<string> {
    if (!this.api.legacy) return null;
    const parameters = params.map(serializeParameter);
    const json = {reportId: id, parameters, index};
    const res = await this.api.post('/executeReportProperty', {json});
    if (res.ok === false) return null;
    return res.data.result || null;
  }

  /* --- --- */

  private async getRootDataLegacy(id: ClientID): Promise<Res<ClientDataDTO>> {
    const reqOptions: ReqOptions = {query: {formId: id}};
    const [resSettings, resParameters, resChildren, resLayout] = await Promise.all([
      this.api.get('/getFormSettings', reqOptions),
      this.api.get<ParameterInit[]>('/getFormParameters', reqOptions),
      this.api.get<ClientChildrenDTO>('/getChildrenForms', reqOptions),
      this.api.get<IJsonModel>('/getFormLayout', reqOptions),
    ]);

    if (!resChildren.ok) return {ok: false, message: resChildren.message};
    if (!resSettings.ok) return {ok: false, message: resSettings.message};

    const settings = resSettings.data;
    const children = resChildren.data;
    const layout = resLayout.ok ? resLayout.data : ({} as IJsonModel);
    const parameters = resParameters.ok ? resParameters.data : [];
    return {ok: true, data: {settings, channels: [], parameters, children, layout}};
  }

  private async getPresentationDataLegacy(id: ClientID): Promise<Res<ClientDataDTO>> {
    const reqOptions: ReqOptions = {query: {formId: id}};
    const [resSettings, resParameters, resChildren, resLayout, resChannels] = await Promise.all([
      this.api.get('/getFormSettings', reqOptions),
      this.api.get<ParameterInit[]>('/getFormParameters', reqOptions),
      this.api.get<ClientChildrenDTO>('/getChildrenForms', reqOptions),
      this.api.get<IJsonModel>('/getFormLayout', reqOptions),
      this.api.get('/getChannelsForForm', reqOptions),
    ]);
    if (!resChildren.ok) return {ok: false, message: resChildren.message};

    const settings: PresentationSettings = resSettings.ok ? resSettings.data : {};
    const children = resChildren.data;
    const channels: AttachedChannelDTO[] = resChannels?.ok ? resChannels.data : [];
    const layout = resLayout.ok ? resLayout.data : ({} as IJsonModel);
    const parameters = resParameters.ok ? resParameters.data : [];
    return {ok: true, data: {settings, channels, parameters, children, layout}};
  }

  private async getFormDataLegacy(id: FormID, type: ClientType): Promise<Res<ClientDataDTO>> {
    const reqOptions: ReqOptions = {query: {formId: id}};
    const promises: Promise<Res>[] = [this.api.get('/getChannelsForForm', reqOptions)];

    if (type === 'dataSet' || type === 'carat' || type === 'chart') {
      promises.push(this.api.get('/getFormSettings', reqOptions));
    } else if (type === 'map') {
      reqOptions.query.pluginName = 'wellsLinkedClients';
      promises.push(this.api.get('/pluginData', reqOptions));
    }

    const [resChannels, resSettings] = await Promise.all(promises);
    const channels: AttachedChannelDTO[] = resChannels?.ok ? resChannels.data : [];
    const settings = resSettings?.ok ? resSettings.data : {};
    return {ok: true, data: {settings, channels, parameters: []}};
  }

  private async getMapClientDataLegacy(id: FormID): Promise<Res<ClientDataDTO>> {
    const [res, resPlugin] = await Promise.all([
      this.api.get<ClientDataDTO>('/getAllForForm', {query: {formId: id}}),
      this.api.get('/pluginData', {query: {formId: id, pluginName: 'wellsLinkedClients'}}),
    ]);
    if (res.ok) {
      res.data.settings = resPlugin.ok ? resPlugin.data : {};
    }
    return res;
  }
}

/** Запросы клиентов сессии. */
export const clientAPI = new ClientAPI(fetcher);
