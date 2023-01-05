import { Requester } from "./api";


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

  public async getCanRunReport(dataJSON: string): Promise<Res<boolean>> {
    return await this.request<boolean>({method: 'POST', path: 'canRunReport', body: dataJSON});
  }

  public async runReport(dataJSON: string): Promise<Res<Partial<Report>>> {
    return await this.request({method: 'POST', path: 'runReport', body: dataJSON});
  }

  public async getOperationResult(id: string, waitResult = 'false'): Promise<Res<OperationResult>> {
    const query = {sessionId: this.requester.sessionID, operationId: id, waitResult};
    return await this.request<OperationResult>({path: 'getOperationResult', query});
  }
}
