import { BaseAPI, API, getFileExtension } from 'shared/lib';
import { serializeParameter } from 'entities/parameters';


export class ReportAPI {
  constructor(private readonly baseAPI: BaseAPI) {}

  public getPresentationReports(id: ClientID) {
    const query = {sessionId: this.baseAPI.sessionID, formId: id};
    return this.baseAPI.request<ReportModel[]>({path: 'programsList', query});
  }

  public getReportData(id: ReportID) {
    const query = {sessionId: this.baseAPI.sessionID, reportId: id};
    return this.baseAPI.request<ReportData>({path: 'reportData', query});
  }

  public async getProgramVisibility(reportID: ReportID, parameters: Parameter[]) {
    const sessionId = this.baseAPI.sessionID;
    const paramValues = parameters.map(serializeParameter);
    const body = JSON.stringify({sessionId, reportId: reportID, paramValues});
    const req: WRequest = {method: 'POST', path: 'programVisibility', body};
    const res = await this.baseAPI.request<'true' | 'false'>(req);
    return res.ok && res.data === 'true';
  }

  public async getCanRunReport(reportId: ReportID, parameters: Parameter[]) {
    const sessionId = this.baseAPI.sessionID;
    const paramValues = parameters.map(serializeParameter);
    const body = JSON.stringify({sessionId, reportId, paramValues});
    const res = await this.baseAPI.request<boolean>({method: 'POST', path: 'canRunReport', body});
    return res.ok && res.data;
  }

  public executeReportProperty(id: ReportID, params: Parameter[], index: number) {
    const sessionId = this.baseAPI.sessionID;
    const parameters = params.map(serializeParameter);
    const body = JSON.stringify({sessionId, reportId: id, parameters, index});
    const req: WRequest = {method: 'POST', path: 'executeReportProperty', body};
    return this.baseAPI.request<OperationData>(req);
  }

  public async getOperationStatus(id: OperationID): Promise<OperationStatus | null> {
    const query = {sessionId: this.baseAPI.sessionID, operationId: id};
    const res = await this.baseAPI.request<OperationStatus>({path: 'operationStatus', query});
    if (res.ok === false || !res.data) return null;

    const status = res.data;
    status.id = id;
    status.timestamp = new Date(status.timestamp);
    if (status.file) status.file.extension = getFileExtension(status.file.name);
    return status;
  }

  public clearReports(clientID: FormID) {
    const query = {sessionId: this.baseAPI.sessionID, presentationId: clientID};
    return this.baseAPI.request<boolean>({path: 'clearReports', query});
  }

  public uploadFile(fileName: string, body: string | ArrayBuffer) {
    const query = {sessionId: this.baseAPI.sessionID, filename: fileName};
    return this.baseAPI.request<string>({method: 'POST', path: 'uploadFile', query, body});
  }

  public downloadFile(path: string) {
    const query = {sessionId: this.baseAPI.sessionID, path};
    return this.baseAPI.request<Blob>({path: 'downloadResource', query, mapper: 'blob'});
  }

  public exportToExcel(data: any) {
    data.sessionId = this.baseAPI.sessionID;
    data.paramValues = data.paramValues.map(serializeParameter);
    const body = JSON.stringify(data);
    return this.baseAPI.request<OperationData>({method: 'POST', path: 'exportToExcel', body});
  }
}

export const reportsAPI = new ReportAPI(API);
