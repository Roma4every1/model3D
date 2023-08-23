import { BaseAPI, API } from 'shared/lib';
import { serializeParameter } from 'entities/parameters';


export class ReportsAPI {
  constructor(private readonly baseAPI: BaseAPI) {}

  public getPresentationReports(id: FormID) {
    const query = {sessionId: this.baseAPI.sessionID, formId: id};
    return this.baseAPI.request<ReportModel[]>({path: 'programsList', query});
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
  public async getReportParametersHidden(reportID: ReportID): Promise<Record<ParameterID, boolean>> {
    const query = {sessionId: this.baseAPI.sessionID, formId: reportID};
    const res = await this.baseAPI.request<any>({path: 'getAllNeedParametersForForm', query});
    return res.ok ? res.data : {};
  };

  public async getCanRunReport(reportId: ReportID, parameters: Parameter[]) {
    const sessionId = this.baseAPI.sessionID;
    const paramValues = parameters.map(serializeParameter);
    const body = JSON.stringify({sessionId, reportId, paramValues});
    const res = await this.baseAPI.request<boolean>({method: 'POST', path: 'canRunReport', body});
    return res.ok && res.data;
  }

  public runReport(reportId: ReportID, presentationId: FormID, params: Parameter[]) {
    const sessionId = this.baseAPI.sessionID;
    const paramValues = params.map(serializeParameter);
    const body = JSON.stringify({sessionId, reportId, presentationId, paramValues});
    return this.baseAPI.request<NewOperationData>({method: 'POST', path: 'runReport', body});
  }

  public getOperationResult(id: OperationID, wait = false) {
    const query = {sessionId: this.baseAPI.sessionID, operationId: id, waitResult: String(wait)};
    return this.baseAPI.request<OperationResult>({path: 'getOperationResult', query});
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
    const query = {sessionId: this.baseAPI.sessionID, resourceName: path};
    return this.baseAPI.request<Blob>({path: 'downloadResource', query, mapper: 'blob'});
  }

  public exportToExcel(data: any) {
    data.sessionId = this.baseAPI.sessionID;
    data.paramValues = data.paramValues.map(serializeParameter);
    const body = JSON.stringify(data);
    return this.baseAPI.request<NewOperationData>({method: 'POST', path: 'exportToExcel', body});
  }
}

export const reportsAPI = new ReportsAPI(API);
