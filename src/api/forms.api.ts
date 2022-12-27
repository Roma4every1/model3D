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

  /** Запрос настроек формы. */
  public async getFormSettings(formID: FormID): Promise<Res<FormSettings>> {
    const query = {sessionId: this.requester.sessionID, formId: formID};
    return await this.request<FormSettings>({path: 'getFormSettings', query});
  }

  /** Запрос параметров формы. */
  public async getFormParameters(formID: FormID): Promise<Res<FormParameter[]>> {
    const query = {sessionId: this.requester.sessionID, formId: formID};
    return await this.request<FormParameter[]>({path: 'getFormParameters', query});
  }

  /** Запрос дочерних форм. */
  public async getFormChildren(formID: FormID): Promise<Res<FormChildrenState>> {
    const query = {sessionId: this.requester.sessionID, formId: formID};
    return await this.request<FormChildrenState>({path: 'getChildrenForms', query});
  }

  /** Запрос списка каналов формы. */
  public async getFormChannelsList(formID: FormID): Promise<Res<ChannelName[]>> {
    const query = {sessionId: this.requester.sessionID, formId: formID};
    return await this.request<ChannelName[]>({path: 'getChannelsForForm', query});
  }
}
