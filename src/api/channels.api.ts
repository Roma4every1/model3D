import { Requester } from './api';
import { paramToChannelParamData } from '../utils/params.utils';


export class ChannelsAPI {
  constructor(private readonly requester: Requester) {}

  private async request<Expected>(req: WRequest) {
    return this.requester.request<Expected>(req);
  }

  /** Запрос параметров, необходимых для наполнения канала. */
  public async getChannelParameters(channelName: ChannelName): Promise<Res<ParameterID[]>> {
    const query = {sessionId: this.requester.sessionID, channelName};
    return await this.request<ParameterID[]>({path: 'getNeededParamForChannel', query});
  }

  /** Запрос данных канала. */
  public async getChannelData(channelName: ChannelName, parameters: FormParameter[]) {
    const sessionID = this.requester.sessionID;
    const paramValues = parameters.map(paramToChannelParamData);
    const body = JSON.stringify({sessionId: sessionID, channelName, paramValues});
    return await this.request<Channel>({method: 'POST', path: 'getChannelDataByName', body});
  }

  /* --- --- */

  public async getStatistics(tableID: string, columnName: string): Promise<Res<any>> {
    const query = {sessionId: this.requester.sessionID, tableId: tableID, columnName};
    return await this.request<any>({path: 'getStatistics', query})
  }

  public async getNewRow(tableID: string) {
    const query = {sessionId: this.requester.sessionID, tableId: tableID};
    return await this.request<ChannelRow>({path: 'getNewRow', query});
  }

  public async insertRow(tableID: string, newRows: ChannelRow[]) {
    const rowData = JSON.stringify(newRows);
    const query = {sessionId: this.requester.sessionID, tableId: tableID, rowData};
    return await this.request<OperationResult>({path: 'insertRow', query});
  }

  public async updateRow(tableID: string, ids: number[], newRowData: ChannelRow[]) {
    const sessionId = this.requester.sessionID;
    const body = {sessionId, tableId: tableID, rowsIndices: ids.join(','), newRowData};
    const req: WRequest = {method: 'POST', path: 'updateRow', body: JSON.stringify(body)};
    return await this.request<OperationResult>(req);
  }

  public async removeRows(tableID: string, indexes: number[], all: boolean) {
    const sessionId = this.requester.sessionID;
    const query = {sessionId, tableId: tableID, rows: indexes.join(','), removeAll: String(all)};
    return await this.request<OperationResult>({path: 'removeRows', query});
  }
}
