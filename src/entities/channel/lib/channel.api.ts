import type { Res } from 'shared/lib';
import type { ChannelConfigDTO } from './channel.types';
import { Fetcher, fetcher } from 'shared/lib';
import { serializeParameter } from 'entities/parameter';


/** Запросы связанные с каналами. */
export class ChannelAPI {
  constructor(private readonly api: Fetcher) {}

  /** Запрос статических данных канала. */
  public getChannelConfig(name: ChannelName): Promise<Res<ChannelConfigDTO>> {
    if (this.api.legacy) {
      return this.api.get('/channelSettings', {query: {channelName: name}});
    } else {
      return this.api.get('/channel/settings', {query: {name}})
    }
  }

  /** Запрос данных канала. */
  public async getChannelData(
    name: ChannelName, payload: Partial<Parameter>[],
    query?: ChannelQuerySettings, signal?: AbortSignal,
  ): Promise<Res<ChannelData>> {
    if (this.api.legacy) {
      const paramValues = payload.map(serializeParameter);
      if (query) applyQuerySettings(paramValues, query);
      const json = {channelName: name, paramValues};
      const res = await this.api.post('/channelData', {json, signal});
      if (res.ok) res.data = convertLegacyChannelData(res.data);
      return res;
    } else {
      const json: any = {parameters: payload.map(serializeParameter)};
      if (query) {
        if (query.limit !== null) json.limit = query.limit;
        if (query.order?.length) json.order = query.order;
      }
      return this.api.post('/channel/data', {query: {name}, json, signal});
    }
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
    const json = {tableId: queryID, rows: rows.map(toLegacyChannelRow)};
    return this.api.post('/insertRows',{json});
  }

  /** Запрос обновления записи в таблице. */
  public updateRows(queryID: QueryID, indexes: number[], rows: ChannelRow[]): Promise<Res<OperationData>> {
    const json = {tableId: queryID, indexes, rows: rows.map(toLegacyChannelRow)};
    return this.api.post('/updateRows', {json});
  }

  /** Запрос на удаление записей из таблицы. */
  public removeRows(queryID: QueryID, indexes: number[] | 'all'): Promise<Res<OperationData>> {
    const query = {tableId: queryID, rows: Array.isArray(indexes) ? indexes.join(',') : indexes};
    return this.api.get('/removeRows', {query});
  }
}

/** Запросы связанные с каналами. */
export const channelAPI = new ChannelAPI(fetcher);

/* --- Legacy API Support --- */

interface ChannelDataLegacyDTO {
  data: ChannelDataLegacy;
  tableId: string;
}
interface ChannelDataLegacy {
  Rows: ChannelRowLegacy[];
  Columns: ChannelColumnLegacy[];
  DataPart: boolean;
  Editable: boolean;
}
interface ChannelColumnLegacy {
  Name: string;
  NetType: string;
  AllowDBNull: boolean;
}
interface ChannelRowLegacy {
  ID: number | string | null;
  Cells: any[];
}

function applyQuerySettings(parameters: SerializedParameter[], query: ChannelQuerySettings): void {
  if (query.limit === false) {
    parameters.push({id: 'readAllRows', type: 'bool', value: 'true'});
  } else if (Number.isInteger(query.limit)) {
    parameters.push({id: 'maxRowCount', type: 'integer', value: query.limit.toString()});
  }
  if (query.order?.length) {
    const value = query.order.map(sort => sort.column + ' ' + sort.direction).join(',');
    parameters.push({id: 'sortOrder', type: 'sortOrder', value});
  }
}

function convertLegacyChannelData({data, tableId}: ChannelDataLegacyDTO): ChannelData {
  if (!data) return null;
  return {
    queryID: tableId,
    columns: data.Columns.map(convertLegacyChannelColumn),
    rows: data.Rows.map(r => r.Cells),
    dataPart: data.DataPart,
    editable: data.Editable,
  };
}
function convertLegacyChannelColumn(column: ChannelColumnLegacy): ChannelColumn {
  return {name: column.Name, type: column.NetType, nullable: column.AllowDBNull};
}

function toLegacyChannelRow(row: ChannelRow): ChannelRowLegacy {
  return {ID: null, Cells: row};
}
