import { BaseAPI, API } from 'shared/lib';
import { serializeParameter } from 'entities/parameters';


interface ChannelDTO {
  id: ChannelName,
  displayName: DisplayName
  currentRowObjectName: ParameterID | null,
  data: OldChannelDataDTO | null,
  properties: ChannelProperty[],
  tableId: TableID,
}
interface OldChannelDataDTO {
  Rows: ChannelRow[],
  Columns: ChannelColumn[],
  DataPart: boolean,
  Editable: boolean,
}

interface ChannelDataDTO {
  data: ChannelData | null,
  tableID: TableID | null,
}


export class ChannelsAPI {
  constructor(private readonly baseAPI: BaseAPI) {}

  private async request<Expected>(req: WRequest) {
    return this.baseAPI.request<Expected>(req);
  }

  /** Запрос параметров, необходимых для наполнения канала. */
  public async getChannelParameters(channelName: ChannelName): Promise<Res<ParameterID[]>> {
    const query = {sessionId: this.baseAPI.sessionID, channelName};
    return await this.request<ParameterID[]>({path: 'getNeededParamForChannel', query});
  }

  /** Запрос статических данных канала. */
  public async getChannelInfo(channelName: ChannelName): Promise<Res<ChannelInfo>> {
    const resParams = await this.getChannelParameters(channelName);
    const params = resParams.ok ? resParams.data : [];
    const sessionID = this.baseAPI.sessionID;
    const body = JSON.stringify({sessionId: sessionID, channelName, paramValues: []});

    const req: WRequest = {method: 'POST', path: 'getChannelDataByName', body};
    const res = await this.request<ChannelDTO>(req);
    if (!res.ok) return res as Res<ChannelInfo>;
    const channelDTO = res.data;

    const info: ChannelInfo = {
      displayName: channelDTO.displayName ?? '',
      parameters: params,
      properties: channelDTO.properties ?? [],
      currentRowObjectName: channelDTO.currentRowObjectName,
    };
    return {ok: true, data: info};
  }

  /** Запрос данных канала. */
  public async getChannelData(channelName: ChannelName, parameters: Parameter[]) {
    const sessionID = this.baseAPI.sessionID;
    const paramValues = parameters.map(serializeParameter);
    const body = JSON.stringify({sessionId: sessionID, channelName, paramValues});

    const req: WRequest = {method: 'POST', path: 'getChannelDataByName', body};
    const res = await this.request<ChannelDTO>(req);
    if (res.ok === false) return res as Res<ChannelDataDTO>;
    const data = res.data.data;

    const channelData: ChannelData = data ? {
      columns: data.Columns,
      rows: data.Rows,
      dataPart: data.DataPart,
      editable: data.Editable,
    } : null;
    const resData = {data: channelData, tableID: res.data.tableId};
    return {ok: true, data: resData} as Res<ChannelDataDTO>;
  }

  /* --- --- */

  /** Запрос статистики по колонке. */
  public async getStatistics(tableID: TableID, columnName: string): Promise<Res<any>> {
    const query = {sessionId: this.baseAPI.sessionID, tableId: tableID, columnName};
    return await this.request<any>({path: 'getStatistics', query})
  }

  /** Запрос новой записи со стандартными значениями. */
  public async getNewRow(tableID: TableID) {
    const query = {sessionId: this.baseAPI.sessionID, tableId: tableID};
    return await this.request<ChannelRow>({path: 'getNewRow', query});
  }

  /** Запрос на добавление записи в таблицу. */
  public async insertRow(tableID: TableID, newRows: ChannelRow[]) {
    const rowData = JSON.stringify(newRows);
    const query = {sessionId: this.baseAPI.sessionID, tableId: tableID, rowData};
    return await this.request<Report>({path: 'insertRow', query});
  }

  /** Запрос обновления записи в таблице. */
  public async updateRows(tableID: TableID, ids: number[], newRowData: ChannelRow[]) {
    const sessionId = this.baseAPI.sessionID;
    const rowsIndices = ids.join(',');
    const body = JSON.stringify({sessionId, tableId: tableID, rowsIndices, newRowData});
    return await this.request<Report>({method: 'POST', path: 'updateRow', body});
  }

  /** Запрос на удаление записей из таблицы. */
  public async removeRows(tableID: TableID, ids: number[], all: boolean) {
    const sessionId = this.baseAPI.sessionID;
    const query = {sessionId, tableId: tableID, rows: ids.join(','), removeAll: String(all)};
    return await this.request<Report>({path: 'removeRows', query});
  }
}

export const channelsAPI = new ChannelsAPI(API);
