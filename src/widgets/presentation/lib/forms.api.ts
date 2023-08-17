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

  public getPresentationsList(rootFormID: FormID) {
    const query = {sessionId: this.baseAPI.sessionID, formId: rootFormID};
    return this.baseAPI.request<PresentationTreeItem>({path: 'presentationList', query});
  }

  /** Запрос разметки формы. */
  public getFormLayout(formID: FormID) {
    const query = {sessionId: this.baseAPI.sessionID, formId: formID};
    return this.baseAPI.request<IJsonModel>({path: 'getFormLayout', query});
  }

  /** Запрос настроек формы. */
  public getFormSettings(formID: FormID) {
    const query = {sessionId: this.baseAPI.sessionID, formId: formID};
    return this.baseAPI.request<FormSettingsDTO>({path: 'getFormSettings', query});
  }

  /** Запрос параметров формы. */
  public async getFormParameters(formID: FormID) {
    const query = {sessionId: this.baseAPI.sessionID, formId: formID};
    const res = await this.baseAPI.request<Parameter[]>({path: 'getFormParameters', query});

    if (res.ok) {
      res.data.forEach(handleParam);
      return res.data;
    } else {
      return [];
    }
  }

  /** Запрос дочерних форм. */
  public getFormChildren(formID: FormID) {
    const query = {sessionId: this.baseAPI.sessionID, formId: formID};
    return this.baseAPI.request<FormChildrenState>({path: 'getChildrenForms', query});
  }

  /** Запрос списка каналов формы. */
  public async getFormChannelsList(formID: FormID) {
    const query = {sessionId: this.baseAPI.sessionID, formId: formID};
    const res = await this.baseAPI.request<ChannelName[]>({path: 'getChannelsForForm', query});
    return res.ok ? res.data : [];
  }

  // /** Запрос дополнительных данных о форме (плагинов). */
  // public getPluginData(formID: FormID, pluginName: string) {
  //   const query = {sessionId: this.baseAPI.sessionID, formId: formID, pluginName};
  //   return this.baseAPI.request<any>({path: 'pluginData', query});
  // }
}

export const formsAPI = new FormsAPI(API);
