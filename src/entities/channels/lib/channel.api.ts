import { BaseAPI, API } from 'shared/lib';
import { serializeParameter } from 'entities/parameters';
import { applyQuerySettings } from './common';


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


/** Запросы связанные с каналами. */
export class ChannelAPI {
  constructor(private readonly baseAPI: BaseAPI) {}

  /** Запрос статических данных канала. */
  public async getChannelInfo(channelName: ChannelName): Promise<Res<ChannelInfo>> {
    const query = {sessionId: this.baseAPI.sessionID, channelName};
    return await this.baseAPI.request<ChannelInfo>({path: 'channelSettings', query});
  }

  /** Запрос данных канала. */
  public async getChannelData(
    name: ChannelName, parameters: Partial<Parameter>[],
    query: ChannelQuerySettings
  ): Promise<Res<ChannelDataDTO>> {
    const sessionID = this.baseAPI.sessionID;
    const paramValues = parameters.map(serializeParameter);
    applyQuerySettings(paramValues, query);
    const body = JSON.stringify({sessionId: sessionID, channelName: name, paramValues});

    const req: WRequest = {method: 'POST', path: 'channelData', body};
    const res = await this.baseAPI.request<ChannelDTO>(req);
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
  public getStatistics(tableID: TableID, columnName: string): Promise<Res<any>> {
    const query = {sessionId: this.baseAPI.sessionID, tableId: tableID, columnName};
    return this.baseAPI.request<any>({path: 'getStatistics', query})
  }

  /** Запрос новой записи со стандартными значениями. */
  public getNewRow(tableID: TableID) {
    const query = {sessionId: this.baseAPI.sessionID, tableId: tableID};
    return this.baseAPI.request<ChannelRow>({path: 'getNewRow', query});
  }

  /** Запрос на добавление записи в таблицу. */
  public insertRows(tableID: TableID, rows: ChannelRow[]) {
    const body = JSON.stringify({sessionId: this.baseAPI.sessionID, tableId: tableID, rows})
    return this.baseAPI.request<OperationData>({method: 'POST', path: 'insertRows', body});
  }

  /** Запрос обновления записи в таблице. */
  public updateRows(tableID: TableID, indexes: number[], rows: ChannelRow[]) {
    const sessionId = this.baseAPI.sessionID;
    const body = JSON.stringify({sessionId, tableId: tableID, indexes, rows});
    return this.baseAPI.request<OperationData>({method: 'POST', path: 'updateRows', body});
  }

  /** Запрос на удаление записей из таблицы. */
  public removeRows(tableID: TableID, indexes: number[] | 'all') {
    const sessionId = this.baseAPI.sessionID;
    const rows = Array.isArray(indexes) ? indexes.join(',') : indexes;
    const query = {sessionId, tableId: tableID, rows};
    return this.baseAPI.request<OperationData>({path: 'removeRows', query});
  }
}

/** Запросы связанные с каналами. */
export const channelAPI = new ChannelAPI(API);
