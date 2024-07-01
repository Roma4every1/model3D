import type { Res } from 'shared/lib';
import type { ParameterInit } from 'entities/parameter';
import { Fetcher, fetcher, getFileExtension } from 'shared/lib';
import { serializeParameter } from 'entities/parameter';


export interface ReportModelDTO {
  id: ReportID;
  type?: ReportType;
  displayName: string;
  paramsForCheckVisibility?: string[];
}
/** Данные о параметрах и составных частях отчёта. */
export interface ReportData {
  /** Кастомные параметры процедуры. */
  parameters: ParameterInit[];
  /** Все необходимые параметры для процедуры (для `reportString` и `queryString` false). */
  replaces: Record<string, boolean>;
  /** Количество исполняемых блоков процедуры. */
  linkedPropertyCount: number;
}


export class ReportAPI {
  constructor(private readonly api: Fetcher) {}

  public async getPresentationReports(id: ClientID): Promise<Res<ReportModelDTO[]>> {
    if (!this.api.legacy) return {ok: true, data: []};
    return await this.api.get('/programsList', {query: {formId: id}});
  }

  public getReportData(id: ReportID): Promise<Res<ReportData>> {
    return this.api.get('/reportData',{query: {reportId: id}});
  }

  public async getReportAvailability(reportID: ReportID, parameters: Parameter[]): Promise<boolean> {
    const json = {reportId: reportID, paramValues: parameters.map(serializeParameter)};
    const res = await this.api.post<boolean>('/programVisibility', {json});
    return res.ok && res.data === true;
  }

  public async canRunReport(id: ReportID, parameters: Parameter[]): Promise<boolean> {
    const json = {reportId: id, paramValues: parameters.map(serializeParameter)};
    const res = await this.api.post<boolean>('/canRunReport', {json});
    return res.ok && res.data === true;
  }

  public executeReportProperty(id: ReportID, params: Parameter[], index: number): Promise<Res<OperationData>> {
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

  public clearReports(clientID: ClientID): Promise<Res<boolean>> {
    return this.api.get('/clearReports', {query: {presentationId: clientID}});
  }

  public uploadFile(filename: string, data: ArrayBuffer): Promise<Res<string>> {
    return this.api.post('/uploadFile', {query: {filename}, blob: data});
  }

  public downloadFile(path: string): Promise<Res<Blob>> {
    return this.api.get('/downloadResource', {query: {path}, then: 'blob'});
  }

  public exportToExcel(data: any): Promise<Res<OperationData>> {
    data.paramValues = data.paramValues.map(serializeParameter);
    return this.api.post('/exportToExcel', {json: data});
  }
}

export const reportAPI = new ReportAPI(fetcher);
