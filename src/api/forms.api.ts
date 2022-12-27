import { Requester } from "./api";


export class FormsAPI {
  constructor(private readonly requester: Requester) {}

  private async request<Expected>(req: WRequest) {
    return this.requester.request<Expected>(req);
  }

  /** Запрос корневой формы. */
  public async getRootForm(): Promise<Res<FormDataWMR>> {
    const query = {sessionId: this.requester.sessionID};
    return await this.request<FormDataWMR>({path: 'getRootForm', query});
  }
}
