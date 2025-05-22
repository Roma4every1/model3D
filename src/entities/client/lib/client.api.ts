import type { Res, XRawElement } from 'shared/lib';
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
  readonly parameterToSet: string;
  readonly parametersToExecute: string[];
  readonly index: number;
}


export class ClientAPI {
  constructor(private readonly api: Fetcher) {}

  public getClientData(id: ClientID, type: ClientType): Promise<Res<ClientDataDTO>> {
    if (this.api.legacy) {
      if (type === 'map') {
        return this.getMapClientDataLegacy(id);
      } else {
        return this.api.get('/getAllForForm', {query: {formId: id}});
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
