import { BaseAPI, API } from 'shared/lib';
import { serializeParameter } from 'entities/parameters';


export class ProgramsAPI {
  constructor(private readonly baseAPI: BaseAPI) {}

  private async request<Expected>(req: WRequest) {
    return this.baseAPI.request<Expected>(req);
  }

  public getProgramsList(formID: FormID): Promise<Res<ProgramListData>> {
    const query = {sessionId: this.baseAPI.sessionID, formId: formID};
    return this.request<ProgramListData>({path: 'programsList', query});
  }

  public async getProgramVisibility(reportID: string, parameters: FormParameter[]) {
    const sessionId = this.baseAPI.sessionID;
    const paramValues = parameters.map(serializeParameter);
    const body = JSON.stringify({sessionId, reportId: reportID, paramValues});
    const req: WRequest = {method: 'POST', path: 'programVisibility', body};
    const res = await this.request<'true' | 'false'>(req);
    return res.ok && res.data === 'true';
  }

  public async getReportParameters(reportID: string) {
    const query = {sessionId: this.baseAPI.sessionID, formId: reportID};
    const res = await this.request<any[]>({path: 'getAllNeedParametersForForm', query});
    if (!res.ok) return res;
    res.data = Object.entries(res.data).map(([Key, Value]) => ({Key, Value}));
    return res;
  };

  public getCanRunReport(reportId: string, paramValues: FormParameter[]) {
    const sessionId = this.baseAPI.sessionID;
    const body = JSON.stringify({sessionId, reportId, paramValues});
    return this.request<boolean>({method: 'POST', path: 'canRunReport', body});
  }

  public runReport(reportId: string, presentationId: string, paramValues: FormParameter[]) {
    const sessionId = this.baseAPI.sessionID;
    const body = JSON.stringify({sessionId, reportId, presentationId, paramValues});
    return this.request<Report>({method: 'POST', path: 'runReport', body});
  }

  public getOperationResult(id: string, waitResult = 'false') {
    const query = {sessionId: this.baseAPI.sessionID, operationId: id, waitResult};
    return this.request<OperationResult>({path: 'getOperationResult', query});
  }

  public async clearReports(id: string): Promise<void> {
    const query = {sessionId: this.baseAPI.sessionID, presentationId: id};
    await this.request<any>({path: 'clearReports', query});
  }

  public uploadFile(fileName: string, data: string | ArrayBuffer) {
    const query = {sessionId: this.baseAPI.sessionID, filename: fileName};
    return this.request<string>({method: 'POST', path: 'uploadFile', query, body: data});
  }

  public downloadFile(resourceName: string) {
    const query = {sessionId: this.baseAPI.sessionID, resourceName};
    return this.request<Blob>({path: 'downloadResource', query, mapper: 'blob'});
  }

  public exportToExcel(data: any) {
    data.sessionId = this.baseAPI.sessionID;
    const body = JSON.stringify(data);
    return this.request<any>({method: 'POST', path: 'exportToExcel', body});
  }
}

export const programsAPI = new ProgramsAPI(API);
