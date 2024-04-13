import { Res, Fetcher, fetcher } from 'shared/lib';
import { IJsonModel } from 'flexlayout-react';
import { prepareParameterList, serializeParameter } from 'entities/parameters';


type FormSettingsDTO = DockSettings | GridFormSettings | FormSettings;


export class FormsAPI {
  constructor(private readonly api: Fetcher) {}

  /** Запрос корневой формы. */
  public getRootForm(): Promise<Res<FormDataWM>> {
    return this.api.get('/getRootForm');
  }

  public getPresentationTree(rootFormID: ClientID): Promise<Res<PresentationTreeItem>> {
    return this.api.get('/presentationList', {query: {formId: rootFormID}});
  }

  /** Запрос разметки формы. */
  public getPresentationLayout(id: ClientID): Promise<Res<IJsonModel>> {
    return this.api.get('/getFormLayout', {query: {formId: id}});
  }

  /** Запрос настроек формы. */
  public getFormSettings(id: FormID): Promise<Res<FormSettingsDTO>> {
    return this.api.get('/getFormSettings', {query: {formId: id}});
  }

  /** Запрос параметров формы. */
  public async getClientParameters(id: ClientID): Promise<Parameter[]> {
    const res = await this.api.get('/getFormParameters', {query: {formId: id}});
    return res.ok ? prepareParameterList(res.data) : [];
  }

  /** Запрос дочерних форм. */
  public getClientChildren(id: ClientID): Promise<Res<FormChildrenState>> {
    return this.api.get('/getChildrenForms', {query: {formId: id}});
  }

  /** Запрос списка каналов формы. */
  public async getClientAttachedChannels(id: ClientID): Promise<AttachedChannel[]> {
    const query = {formId: id};
    const { ok, data } = await this.api.get<any[]>('/getChannelsForForm', {query});

    if (!ok || data.length == 0) return [];
    if (typeof data[0] === 'object') return data;
    return data.map(c => ({name: c, attachOption: 'AttachAll', exclude: []}));
  }

  /** Выполнение привязанного свойства презентации. */
  public async executeLinkedProperty(id: ClientID, params: Parameter[], index: number): Promise<string> {
    const parameters = params.map(serializeParameter);
    const json = {reportId: id, parameters, index};
    const res = await this.api.post('/executeReportProperty', {json});
    if (res.ok === false) return null;
    return res.data.result || null;
  }

  /** Запрос дополнительных данных о форме (плагинов). */
  public getPluginData(clientID: ClientID, pluginName: string): Promise<Res> {
    return this.api.get('/pluginData', {query: {formId: clientID, pluginName}});
  }
}

export const formsAPI = new FormsAPI(fetcher);
