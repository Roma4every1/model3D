import { Res, Fetcher, fetcher } from 'shared/lib';
import { serializeParameter } from 'entities/parameters';
import { applyQuerySettings } from './common';


/** Запись из данных канала. */
export interface ChannelRowOld {
  ID: number | null;
  Cells: any[];
}

interface OldChannelDataDTO {
  Rows: ChannelRowOld[];
  Columns: any[];
  DataPart: boolean;
  Editable: boolean;
}

interface ChannelDataDTO {
  data: ChannelData | null;
  queryID: QueryID | null;
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

    const res = await this.api.post('/channelData', {json});
    if (res.ok === false) return res as any;
    const data: OldChannelDataDTO = res.data.data;

    const channelData: ChannelData = data ? {
      columns: data.Columns.map(c => ({name: c.Name, type: c.NetType, nullable: c.AllowDBNull})),
      rows: data.Rows.map(r => r.Cells),
      dataPart: data.DataPart,
      editable: data.Editable,
    } : null;

    const resData: ChannelDataDTO = {data: channelData, queryID: res.data.tableId};
    return {ok: true, data: resData};
  }

  /** Запрос ресурса из базы данных. */
  public getResource(queryID: QueryID, rowIndex: number, columnName: string): Promise<Res<Blob>> {
    const query = {tableId: queryID, index: rowIndex, name: columnName};
    return this.api.get<Blob>('/dbResource',{query, then: 'blob'});
  }

  /* --- --- */

  /** Запрос статистики по колонке. */
  public getStatistics(queryID: QueryID, columnName: string): Promise<Res> {
    const query = {tableId: queryID, columnName};
    return this.api.get('/getStatistics', {query})
  }

  /** Запрос новой записи со стандартными значениями. */
  public async getNewRow(queryID: QueryID): Promise<Res<ChannelRow>> {
    const query = {tableId: queryID};
    const res = await this.api.get('/getNewRow', {query});
    if (res.ok) res.data = res.data.Cells;
    return res;
  }

  /** Запрос на добавление записи в таблицу. */
  public insertRows(queryID: QueryID, rows: ChannelRow[]): Promise<Res<OperationData>> {
    const json = {tableId: queryID, rows: rows.map(toChannelRowOld)};
    return this.api.post('/insertRows',{json});
  }

  /** Запрос обновления записи в таблице. */
  public updateRows(queryID: QueryID, indexes: number[], rows: ChannelRow[]): Promise<Res<OperationData>> {
    const json = {tableId: queryID, indexes, rows: rows.map(toChannelRowOld)};
    return this.api.post('/updateRows', {json});
  }

  /** Запрос на удаление записей из таблицы. */
  public removeRows(queryID: QueryID, indexes: number[] | 'all'): Promise<Res<OperationData>> {
    const query = {tableId: queryID, rows: Array.isArray(indexes) ? indexes.join(',') : indexes};
    return this.api.get('/removeRows', {query});
  }
}

function toChannelRowOld(row: ChannelRow): ChannelRowOld {
  return {ID: null, Cells: row};
}

/** Запросы связанные с каналами. */
export const channelAPI = new ChannelAPI(fetcher);
