import { BaseAPI, API } from 'shared/lib';
import { IJsonModel } from 'flexlayout-react';
import { handleParam } from 'entities/parameters';


type FormSettingsDTO = DockSettings | GridFormSettings | FormSettings;


export class FormsAPI {
  constructor(private readonly baseAPI: BaseAPI) {}

  /** Запрос корневой формы. */
  public getRootForm() {
    return this.baseAPI.request<FormDataWM>({path: 'getRootForm'});
  }

  public getPresentationTree(rootFormID: ClientID) {
    const query = {formId: rootFormID};
    return this.baseAPI.request<PresentationTreeItem>({path: 'presentationList', query});
  }

  /** Запрос разметки формы. */
  public getPresentationLayout(id: ClientID) {
    const req: WRequest = {path: 'getFormLayout', query: {formId: id}};
    return this.baseAPI.request<IJsonModel>(req);
  }

  /** Запрос настроек формы. */
  public getFormSettings(id: FormID) {
    const req: WRequest = {path: 'getFormSettings', query: {formId: id}};
    return this.baseAPI.request<FormSettingsDTO>(req);
  }

  /** Запрос параметров формы. */
  public async getClientParameters(id: ClientID) {
    const req: WRequest = {path: 'getFormParameters', query: {formId: id}};
    const res = await this.baseAPI.request<Parameter[]>(req);

    if (res.ok) {
      res.data.forEach(handleParam);
      return res.data;
    } else {
      return [];
    }
  }

  /** Запрос дочерних форм. */
  public getClientChildren(id: ClientID) {
    const req: WRequest = {path: 'getChildrenForms', query: {formId: id}};
    return this.baseAPI.request<FormChildrenState>(req);
  }

  /** Запрос списка каналов формы. */
  public async getClientAttachedChannels(id: ClientID): Promise<AttachedChannel[]> {
    const req: WRequest = {path: 'getChannelsForForm', query: {formId: id}};
    const res = await this.baseAPI.request<ChannelName[]>(req);
    return res.ok ? res.data.map(c => ({name: c, attachOption: 'AttachAll', exclude: []})) : [];
  }
}

export const formsAPI = new FormsAPI(API);
