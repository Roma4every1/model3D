import type { Res, XRawElement } from 'shared/lib';
import type { ParameterInit } from 'entities/parameter';
import { Fetcher, fetcher } from 'shared/lib';
import { serializeParameter } from 'entities/parameter';


export interface ClientDataDTO<S = any> {
  settings: S;
  channels: AttachedChannelDTO[];
  parameters: ParameterInit[];
  children?: ClientChildrenDTO;
  layout?: XRawElement;
  extra?: XRawElement;
}
export interface ParameterSetterDTO {
  readonly parameterToSet: string;
  readonly parametersToExecute: string[];
  readonly index: number;
}

export class ClientAPI {
  constructor(private readonly api: Fetcher) {}

  /** Получение данных клиента сессии. */
  public getClientData(id: ClientID): Promise<Res<ClientDataDTO>> {
    if (this.api.legacy) {
      return this.api.get('/getAllForForm', {query: {formId: id}});
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
}

/** Запросы клиентов сессии. */
export const clientAPI = new ClientAPI(fetcher);
