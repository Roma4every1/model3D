import { Res, Fetcher, fetcher } from 'shared/lib';
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
  constructor(private readonly api: Fetcher) {}

  /** Запрос статических данных канала. */
  public getChannelInfo(channelName: ChannelName): Promise<Res<ChannelInfo>> {
    return this.api.get<ChannelInfo>('/channelSettings', {query: {channelName}});
  }

  /** Запрос данных канала. */
  public async getChannelData(
    name: ChannelName, parameters: Partial<Parameter>[],
    query: ChannelQuerySettings
  ): Promise<Res<ChannelDataDTO>> {
    const paramValues = parameters.map(serializeParameter);
    applyQuerySettings(paramValues, query);
    const json = {channelName: name, paramValues};

    const res = await this.api.post<ChannelDTO>('/channelData', {json});
    if (res.ok === false) return res as any;
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
    const query = {tableId: tableID, index: rowIndex, name: columnName};
    return this.api.get<Blob>('/dbResource',{query, then: 'blob'});
  }

  /* --- --- */

  /** Запрос статистики по колонке. */
  public getStatistics(tableID: TableID, columnName: string): Promise<Res> {
    const query = {tableId: tableID, columnName};
    return this.api.get('/getStatistics', {query})
  }

  /** Запрос новой записи со стандартными значениями. */
  public getNewRow(tableID: TableID): Promise<Res<ChannelRow>> {
    return this.api.get('/getNewRow', {query: {tableId: tableID}});
  }

  /** Запрос на добавление записи в таблицу. */
  public insertRows(tableID: TableID, rows: ChannelRow[]): Promise<Res<OperationData>> {
    const json = {tableId: tableID, rows};
    return this.api.post('/insertRows',{json});
  }

  /** Запрос обновления записи в таблице. */
  public updateRows(tableID: TableID, indexes: number[], rows: ChannelRow[]): Promise<Res<OperationData>> {
    const json = {tableId: tableID, indexes, rows};
    return this.api.post('/updateRows', {json});
  }

  /** Запрос на удаление записей из таблицы. */
  public removeRows(tableID: TableID, indexes: number[] | 'all'): Promise<Res<OperationData>> {
    const query = {tableId: tableID, rows: Array.isArray(indexes) ? indexes.join(',') : indexes};
    return this.api.get('/removeRows', {query});
  }
}

/** Запросы связанные с каналами. */
export const channelAPI = new ChannelAPI(fetcher);
