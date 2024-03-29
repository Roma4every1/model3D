import { BaseAPI, API } from 'shared/lib';
import { IJsonModel } from 'flexlayout-react';
import { prepareParameterList, serializeParameter } from 'entities/parameters';


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
    return res.ok ? prepareParameterList(res.data) : [];
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

  /** Выполнение привязанного свойства презентации. */
  public async executeLinkedProperty(id: ClientID, params: Parameter[], index: number): Promise<string> {
    const parameters = params.map(serializeParameter);
    const body = JSON.stringify({reportId: id, parameters, index});
    const req: WRequest = {method: 'POST', path: 'executeReportProperty', body};

    const res = await this.baseAPI.request<OperationData>(req);
    if (res.ok === false) return null;
    return res.data.result || null;
  }

  /** Запрос дополнительных данных о форме (плагинов). */
  public getPluginData(formID: FormID, pluginName: string) {
    const query = {formId: formID, pluginName};
    return this.baseAPI.request<any>({path: 'pluginData', query});
  }
}

export const formsAPI = new FormsAPI(API);
