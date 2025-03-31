import type { Res } from 'shared/lib';
import type { ParameterInit } from 'entities/parameter';
import { Fetcher, fetcher, getFileExtension } from 'shared/lib';
import { serializeParameter } from 'entities/parameter';


export interface ProgramDTO {
  id: ProgramID;
  type?: ProgramType;
  displayName: string;
  paramsForCheckVisibility?: string[];
}
/** Данные о параметрах и составных частях отчёта. */
export interface ProgramData {
  /** Кастомные параметры процедуры. */
  parameters: ParameterInit[];
  /** Все необходимые параметры для процедуры (для `reportString` и `queryString` false). */
  replaces: Record<string, boolean>;
  /** Количество исполняемых блоков процедуры. */
  linkedPropertyCount: number;
}


export class ProgramAPI {
  constructor(private readonly api: Fetcher) {}

  public async getProgramList(id: ClientID): Promise<Res<ProgramDTO[]>> {
    if (!this.api.legacy) return {ok: true, data: []};
    return await this.api.get('/programsList', {query: {formId: id}});
  }

  public getProgramData(id: ProgramID): Promise<Res<ProgramData>> {
    return this.api.get('/reportData',{query: {reportId: id}});
  }

  public async getProgramAvailability(id: ProgramID, parameters: Parameter[]): Promise<boolean> {
    const json = {reportId: id, paramValues: parameters.map(serializeParameter)};
    const res = await this.api.post<boolean>('/programVisibility', {json});
    return res.ok && res.data === true;
  }

  public async canRunProgram(id: ProgramID, parameters: Parameter[]): Promise<boolean> {
    const json = {reportId: id, paramValues: parameters.map(serializeParameter)};
    const res = await this.api.post<boolean>('/canRunReport', {json});
    return res.ok && res.data === true;
  }

  public executeReportProperty(id: ProgramID, params: Parameter[], index: number): Promise<Res<OperationData>> {
    const parameters = params.map(serializeParameter);
    const json = {reportId: id, parameters, index};
    return this.api.post('/executeReportProperty', {json});
  }

  public async getOperationStatus(id: OperationID): Promise<Res<OperationStatus>> {
    const query = {operationId: id};
    const res = await this.api.get('/operationStatus',{query});

    if (res.ok && res.data) {
      const status = res.data;
      status.id = id;
      status.timestamp = new Date(status.timestamp);
      if (status.file) status.file.extension = getFileExtension(status.file.name);
    }
    return res;
  }

  public clearPrograms(clientID: ClientID): Promise<Res<boolean>> {
    return this.api.get('/clearReports', {query: {presentationId: clientID}});
  }

  public uploadFile(filename: string, data: ArrayBuffer, signal?: AbortSignal): Promise<Res<string>> {
    return this.api.post('/uploadFile', {query: {filename}, blob: data, signal});
  }

  public downloadFile(path: string): Promise<Res<Blob>> {
    const apiPath = this.api.legacy ? '/downloadResource' : '/app/resource';
    return this.api.get(apiPath, {query: {path}, then: 'blob'});
  }
}

export const programAPI = new ProgramAPI(fetcher);
