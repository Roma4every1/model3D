import { Res, Fetcher, fetcher, getFileExtension } from 'shared/lib';
import { prepareParameterList, serializeParameter } from 'entities/parameters';


export class ReportAPI {
  constructor(private readonly api: Fetcher) {}

  public getPresentationReports(id: ClientID): Promise<Res<ReportModel[]>> {
    return this.api.get('/programsList', {query: {formId: id}});
  }

  public async getReportData(id: ReportID): Promise<Res<ReportData>> {
    const res = await this.api.get('/reportData',{query: {reportId: id}});
    if (res.ok) prepareParameterList(res.data.parameters);
    return res;
  }

  public async getReportAvailability(reportID: ReportID, parameters: Parameter[]): Promise<boolean> {
    const json = {reportId: reportID, paramValues: parameters.map(serializeParameter)};
    const res = await this.api.post<boolean>('/programVisibility', {json});
    return res.ok && res.data === true;
  }

  public async getCanRunReport(reportID: ReportID, parameters: Parameter[]): Promise<boolean> {
    const json = {reportId: reportID, paramValues: parameters.map(serializeParameter)};
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

export const reportsAPI = new ReportAPI(fetcher);
