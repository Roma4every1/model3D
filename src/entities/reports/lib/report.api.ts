import { BaseAPI, API, getFileExtension } from 'shared/lib';
import { prepareParameterList, serializeParameter } from 'entities/parameters';


export class ReportAPI {
  constructor(private readonly baseAPI: BaseAPI) {}

  public getPresentationReports(id: ClientID) {
    const req: WRequest = {path: 'programsList', query: {formId: id}};
    return this.baseAPI.request<ReportModel[]>(req);
  }

  public async getReportData(id: ReportID) {
    const query = {reportId: id};
    const res = await this.baseAPI.request<ReportData>({path: 'reportData', query});
    if (res.ok) prepareParameterList(res.data.parameters);
    return res;
  }

  public async getReportAvailability(reportID: ReportID, parameters: Parameter[]) {
    const paramValues = parameters.map(serializeParameter);
    const body = JSON.stringify({reportId: reportID, paramValues});
    const req: WRequest = {method: 'POST', path: 'programVisibility', body};
    const res = await this.baseAPI.request<boolean>(req);
    return res.ok && res.data === true;
  }

  public async getCanRunReport(reportID: ReportID, parameters: Parameter[]) {
    const body = {reportId: reportID, paramValues: parameters.map(serializeParameter)};
    const req: WRequest = {method: 'POST', path: 'canRunReport', body: JSON.stringify(body)};
    const res = await this.baseAPI.request<boolean>(req);
    return res.ok && res.data;
  }

  public executeReportProperty(id: ReportID, params: Parameter[], index: number) {
    const parameters = params.map(serializeParameter);
    const body = JSON.stringify({reportId: id, parameters, index});
    const req: WRequest = {method: 'POST', path: 'executeReportProperty', body};
    return this.baseAPI.request<OperationData>(req);
  }

  public async getOperationStatus(id: OperationID) {
    const query = {operationId: id};
    const res = await this.baseAPI.request<OperationStatus>({path: 'operationStatus', query});

    if (res.ok && res.data) {
      const status = res.data;
      status.id = id;
      status.timestamp = new Date(status.timestamp);
      if (status.file) status.file.extension = getFileExtension(status.file.name);
    }
    return res;
  }

  public clearReports(clientID: FormID) {
    const query = {presentationId: clientID};
    return this.baseAPI.request<boolean>({path: 'clearReports', query});
  }

  public uploadFile(fileName: string, body: string | ArrayBuffer) {
    const query = {filename: fileName};
    return this.baseAPI.request<string>({method: 'POST', path: 'uploadFile', query, body});
  }

  public downloadFile(path: string) {
    const req: WRequest = {path: 'downloadResource', query: {path}, mapper: 'blob'};
    return this.baseAPI.request<Blob>(req);
  }

  public exportToExcel(data: any) {
    data.paramValues = data.paramValues.map(serializeParameter);
    const body = JSON.stringify(data);
    return this.baseAPI.request<OperationData>({method: 'POST', path: 'exportToExcel', body});
  }
}

export const reportsAPI = new ReportAPI(API);
