import type { Res, ReqOptions } from 'shared/lib';
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
}


export class ClientAPI {
  constructor(private readonly api: Fetcher) {}

  public getClientData(id: ClientID, type: ClientType): Promise<Res<ClientDataDTO>> {
    if (this.api.legacy) {
      if (type === 'dock') {
        return this.getRootDataLegacy(id);
      } else if (type === 'grid') {
        return this.getPresentationDataLegacy(id);
      } else {
        return this.getFormDataLegacy(id, type);
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
    const [resSettings, resParameters, resChildren, resLayout, resTree] = await Promise.all([
      this.api.get('/getFormSettings', reqOptions),
      this.api.get<ParameterInit[]>('/getFormParameters', reqOptions),
      this.api.get<ClientChildrenDTO>('/getChildrenForms', reqOptions),
      this.api.get<IJsonModel>('/getFormLayout', reqOptions),
      this.api.get<PresentationTree>('/presentationList', reqOptions),
    ]);

    if (!resChildren.ok) return {ok: false, message: resChildren.message};
    if (!resTree.ok) return {ok: false, message: resTree.message};

    const settings: any = resSettings.ok ? resSettings.data : {};
    settings.presentationTree = resTree.data;

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
    const channels = this.getAttachedChannels(resChannels);
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
    const channels = this.getAttachedChannels(resChannels);
    const settings = resSettings?.ok ? resSettings.data : {};
    return {ok: true, data: {settings, channels, parameters: []}};
  }

  private getAttachedChannels(res: Res<any[]>): AttachedChannelDTO[] {
    if (res.ok && res.data.length > 0) {
      if (typeof res.data[0] === 'object') {
        return res.data;
      } else {
        return res.data.map(c => ({name: c}));
      }
    }
    return [];
  }
}

/** Запросы клиентов сессии. */
export const clientAPI = new ClientAPI(fetcher);
