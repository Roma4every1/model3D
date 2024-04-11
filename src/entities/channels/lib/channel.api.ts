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
  public getChannelInfo(channelName: ChannelName): Promise<Res<ChannelInfo>> {
    const req: WRequest = {path: 'channelSettings', query: {channelName}}
    return this.baseAPI.request<ChannelInfo>(req);
  }

  /** Запрос данных канала. */
  public async getChannelData(
    name: ChannelName, parameters: Partial<Parameter>[],
    query: ChannelQuerySettings
  ): Promise<Res<ChannelDataDTO>> {
    const paramValues = parameters.map(serializeParameter);
    applyQuerySettings(paramValues, query);
    const body = JSON.stringify({channelName: name, paramValues});

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

  /** Запрос ресурса из базы данных. */
  public getResource(tableID: TableID, rowIndex: number, columnName: string): Promise<Res<Blob>> {
    const query: ReqQuery = {tableId: tableID, index: rowIndex.toString(), name: columnName};
    return this.baseAPI.request<Blob>({path: 'dbResource', query, mapper: 'blob'});
  }

  /* --- --- */

  /** Запрос статистики по колонке. */
  public getStatistics(tableID: TableID, columnName: string): Promise<Res<any>> {
    const query = {tableId: tableID, columnName};
    return this.baseAPI.request<any>({path: 'getStatistics', query})
  }

  /** Запрос новой записи со стандартными значениями. */
  public getNewRow(tableID: TableID) {
    const query = {tableId: tableID};
    return this.baseAPI.request<ChannelRow>({path: 'getNewRow', query});
  }

  /** Запрос на добавление записи в таблицу. */
  public insertRows(tableID: TableID, rows: ChannelRow[]) {
    const body = JSON.stringify({tableId: tableID, rows})
    return this.baseAPI.request<OperationData>({method: 'POST', path: 'insertRows', body});
  }

  /** Запрос обновления записи в таблице. */
  public updateRows(tableID: TableID, indexes: number[], rows: ChannelRow[]) {
    const body = JSON.stringify({tableId: tableID, indexes, rows});
    return this.baseAPI.request<OperationData>({method: 'POST', path: 'updateRows', body});
  }

  /** Запрос на удаление записей из таблицы. */
  public removeRows(tableID: TableID, indexes: number[] | 'all') {
    const rows = Array.isArray(indexes) ? indexes.join(',') : indexes;
    const query = {tableId: tableID, rows};
    return this.baseAPI.request<OperationData>({path: 'removeRows', query});
  }
}

/** Запросы связанные с каналами. */
export const channelAPI = new ChannelAPI(API);
