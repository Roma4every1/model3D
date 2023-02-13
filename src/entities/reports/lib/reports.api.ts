import { BaseAPI, API } from 'shared/lib';
import { serializeParameter } from 'entities/parameters';


export class ReportsAPI {
  constructor(private readonly baseAPI: BaseAPI) {}

  public getPresentationReports(id: FormID) {
    const query = {sessionId: this.baseAPI.sessionID, formId: id};
    return this.baseAPI.request<ReportInfo[]>({path: 'programsList', query});
  }

  public async getProgramVisibility(reportID: ReportID, parameters: Parameter[]) {
    const sessionId = this.baseAPI.sessionID;
    const paramValues = parameters.map(serializeParameter);
    const body = JSON.stringify({sessionId, reportId: reportID, paramValues});
    const req: WRequest = {method: 'POST', path: 'programVisibility', body};
    const res = await this.baseAPI.request<'true' | 'false'>(req);
    return res.ok && res.data === 'true';
  }

  /** Словарь: для параметров `QueryString` и `ReportString` false, для всех остальных true. */
  public async getReportParameters(reportID: ReportID) {
    const query = {sessionId: this.baseAPI.sessionID, formId: reportID};
    const res = await this.baseAPI.request<any[]>({path: 'getAllNeedParametersForForm', query});
    if (!res.ok) return res;
    res.data = Object.entries(res.data);
    return res;
  };

  public getCanRunReport(reportId: ReportID, paramValues: Parameter[]) {
    const sessionId = this.baseAPI.sessionID;
    const body = JSON.stringify({sessionId, reportId, paramValues});
    return this.baseAPI.request<boolean>({method: 'POST', path: 'canRunReport', body});
  }

  public runReport(reportId: ReportID, presentationId: FormID, params: Parameter[]) {
    const sessionId = this.baseAPI.sessionID;
    const paramValues = params.map(serializeParameter);
    const body = JSON.stringify({sessionId, reportId, presentationId, paramValues});
    return this.baseAPI.request<Report>({method: 'POST', path: 'runReport', body});
  }

  public getOperationResult(id: string, waitResult = 'false') {
    const query = {sessionId: this.baseAPI.sessionID, operationId: id, waitResult};
    return this.baseAPI.request<OperationResult>({path: 'getOperationResult', query});
  }

  public async clearReports(presentationID: string): Promise<void> {
    const query = {sessionId: this.baseAPI.sessionID, presentationId: presentationID};
    await this.baseAPI.request<any>({path: 'clearReports', query});
  }

  public uploadFile(fileName: string, body: string | ArrayBuffer) {
    const query = {sessionId: this.baseAPI.sessionID, filename: fileName};
    return this.baseAPI.request<string>({method: 'POST', path: 'uploadFile', query, body});
  }

  public downloadFile(resourceName: string) {
    const query = {sessionId: this.baseAPI.sessionID, resourceName};
    return this.baseAPI.request<Blob>({path: 'downloadResource', query, mapper: 'blob'});
  }

  public exportToExcel(data: any) {
    data.sessionId = this.baseAPI.sessionID;
    const body = JSON.stringify(data);
    return this.baseAPI.request<any>({method: 'POST', path: 'exportToExcel', body});
  }
}

export const reportsAPI = new ReportsAPI(API);
