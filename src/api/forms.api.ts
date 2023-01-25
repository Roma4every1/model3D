import { Requester } from './api';
import { IJsonModel } from 'flexlayout-react';
import { parseParamValue } from '../utils/params.utils';


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

  /** Запрос разметки формы. */
  public async getFormLayout(formID: FormID): Promise<Res<IJsonModel>> {
    const query = {sessionId: this.requester.sessionID, formId: formID};
    return await this.request<IJsonModel>({path: 'getFormLayout', query});
  }

  /** Запрос настроек формы. */
  public async getFormSettings(formID: FormID): Promise<Res<FormSettings>> {
    const query = {sessionId: this.requester.sessionID, formId: formID};
    return await this.request<FormSettings>({path: 'getFormSettings', query});
  }

  /** Запрос параметров формы. */
  public async getFormParameters(formID: FormID): Promise<Res<FormParameter[]>> {
    const query = {sessionId: this.requester.sessionID, formId: formID};
    const res = await this.request<FormParameter[]>({path: 'getFormParameters', query});
    if (res.ok) res.data.forEach(parseParamValue);
    return res;
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

  public async getAllNeedParametersForForm(formID: FormID): Promise<Res<any[]>> {
    const query = {sessionId: this.requester.sessionID, formId: formID};
    const res = await this.request<any[]>({path: 'getAllNeedParametersForForm', query});
    if (!res.ok) return res;
    res.data = Object.entries(res.data).map(param => ({Key: param[0], Value: param[1]}));
    return res;
  };
}
