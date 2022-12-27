import { Requester } from "./api";


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
  public async getChannelData(channelName: ChannelName, paramValues: any[]): Promise<Res<any>> {
    const sessionID = this.requester.sessionID;
    const body = JSON.stringify({sessionId: sessionID, channelName, paramValues});
    return await this.request<any>({method: 'POST', path: 'getChannelDataByName', body});
  }

  /* --- --- */

  public async getStatistics(tableID: string, columnName: string): Promise<Res<any>> {
    const query = {sessionId: this.requester.sessionID, tableId: tableID, columnName};
    return await this.request<any>({path: 'getStatistics', query})
  }

  public async getNewRow(tableID: string): Promise<Res<any>> {
    const query = {sessionId: this.requester.sessionID, tableId: tableID};
    return await this.request<any>({path: 'getNewRow', query});
  }

  public async insertRow(tableID: string, rowData: string): Promise<Res<any>> {
    const query = {sessionId: this.requester.sessionID, tableId: tableID, rowData};
    return await this.request<any>({path: 'insertRow', query});
  }

  public async updateRow(tableID: string, rowsIndices, newRowData): Promise<Res<any>> {
    const body = {sessionId: this.requester.sessionID, tableId: tableID, rowsIndices, newRowData};
    const req: WRequest = {method: 'POST', path: 'updateRow', body: JSON.stringify(body)};
    return await this.request<any>(req);
  }

  public async removeRows(tableID: string, rows: string, removeAll: string): Promise<Res<any>> {
    const query = {sessionId: this.requester.sessionID, tableId: tableID, rows, removeAll};
    return await this.request<any>({path: 'removeRows', query});
  }
}
