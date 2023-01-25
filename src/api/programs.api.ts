import { Requester } from './api';


export class ProgramsAPI {
  constructor(private readonly requester: Requester) {}

  private async request<Expected>(req: WRequest) {
    return this.requester.request<Expected>(req);
  }

  public async getProgramsList(formID: FormID): Promise<Res<ProgramListData>> {
    const query = {sessionId: this.requester.sessionID, formId: formID};
    return await this.request<ProgramListData>({path: 'programsList', query});
  }

  public async getProgramVisibility(dataJSON: string): Promise<Res<'true' | 'false'>> {
    return await this.request({method: 'POST', path: 'programVisibility', body: dataJSON});
  }

  public async getCanRunReport(reportId: string, paramValues: FormParameter[]) {
    const sessionId = this.requester.sessionID;
    const body = JSON.stringify({sessionId, reportId, paramValues});
    return await this.request<boolean>({method: 'POST', path: 'canRunReport', body});
  }

  public async runReport(reportId: string, presentationId: string, paramValues: FormParameter[]) {
    const sessionId = this.requester.sessionID;
    const body = JSON.stringify({sessionId, reportId, presentationId, paramValues});
    return await this.request<Report>({method: 'POST', path: 'runReport', body});
  }

  public async getOperationResult(id: string, waitResult = 'false') {
    const query = {sessionId: this.requester.sessionID, operationId: id, waitResult};
    return await this.request<OperationResult>({path: 'getOperationResult', query});
  }

  public async clearReports(id: string): Promise<void> {
    const query = {sessionId: this.requester.sessionID, presentationId: id};
    await this.request<any>({path: 'clearReports', query});
  }
}
