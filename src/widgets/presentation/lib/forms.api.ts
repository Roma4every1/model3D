import { BaseAPI, API } from 'shared/lib';
import { IJsonModel } from 'flexlayout-react';
import { handleParam } from 'entities/parameters';


type FormSettingsDTO = DockSettings | GridFormSettings | FormSettings;


export class FormsAPI {
  constructor(private readonly baseAPI: BaseAPI) {}

  /** Запрос корневой формы. */
  public getRootForm() {
    const query = {sessionId: this.baseAPI.sessionID};
    return this.baseAPI.request<FormDataWM>({path: 'getRootForm', query});
  }

  public getPresentationTree(rootFormID: ClientID) {
    const query = {sessionId: this.baseAPI.sessionID, formId: rootFormID};
    return this.baseAPI.request<PresentationTreeItem>({path: 'presentationList', query});
  }

  /** Запрос разметки формы. */
  public getPresentationLayout(id: ClientID) {
    const query = {sessionId: this.baseAPI.sessionID, formId: id};
    return this.baseAPI.request<IJsonModel>({path: 'getFormLayout', query});
  }

  /** Запрос настроек формы. */
  public getFormSettings(id: FormID) {
    const query = {sessionId: this.baseAPI.sessionID, formId: id};
    return this.baseAPI.request<FormSettingsDTO>({path: 'getFormSettings', query});
  }

  /** Запрос параметров формы. */
  public async getClientParameters(id: ClientID) {
    const query = {sessionId: this.baseAPI.sessionID, formId: id};
    const res = await this.baseAPI.request<Parameter[]>({path: 'getFormParameters', query});

    if (res.ok) {
      res.data.forEach(handleParam);
      return res.data;
    } else {
      return [];
    }
  }

  /** Запрос дочерних форм. */
  public getClientChildren(id: ClientID) {
    const query = {sessionId: this.baseAPI.sessionID, formId: id};
    return this.baseAPI.request<FormChildrenState>({path: 'getChildrenForms', query});
  }

  /** Запрос списка каналов формы. */
  public async getClientAttachedChannels(id: ClientID): Promise<AttachedChannel[]> {
    const query = {sessionId: this.baseAPI.sessionID, formId: id};
    const res = await this.baseAPI.request<ChannelName[]>({path: 'getChannelsForForm', query});
    return res.ok ? res.data.map(c => ({name: c, attachOption: 'AttachAll', exclude: []})) : [];
  }
}

export const formsAPI = new FormsAPI(API);
