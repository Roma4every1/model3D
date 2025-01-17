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
    const json: Record<string, any> = {};
    const parameters = payload.map(serializeParameter);

    if (query) {
      if (query.limit !== null) json.limit = query.limit;
      if (query.order?.length) json.order = query.order;
      if (query.filter) json.filter = query.filter;
    }
    if (this.api.legacy) {
      json.channelName = name;
      json.paramValues = parameters;
      const res = await this.api.post('/channelData', {json, signal});
      if (res.ok) res.data = convertLegacyChannelData(res.data);
      return res;
    } else {
      json.parameters = parameters;
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

  /**
   * Запрос уникальных значений в колонке датасета.
   *
   * **WARN**: Текущая реализация запрашивает весь датасет.
   * Поддержки данной функции на сервере ещё нет.
   */
  public async getColumnUniqueValues(
    name: ChannelName, column: ColumnName,
    payload: Partial<Parameter>[], query?: ChannelQuerySettings, signal?: AbortSignal,
  ): Promise<any[] | null> {
    const parameters = payload.map(serializeParameter);
    const json: Record<string, any> = {channelName: name, paramValues: parameters};

    if (query) {
      if (query.limit !== null) json.limit = query.limit;
      if (query.filter) json.filter = query.filter;
    }
    const res = await this.api.post<ChannelDataLegacyDTO>('/channelData', {json, signal});
    if (!res.ok) return null;

    const data = res.data.data;
    const index = data.Columns.findIndex(c => c.Name === column);
    if (index === -1) return null;

    const set = new Set(data.Rows.map(r => r.Cells[index]));
    set.delete(null);
    return [...set];
  }

  /** Запрос новой записи со стандартными значениями. */
  public async getNewRow(queryID: QueryID): Promise<Res<ChannelRow>> {
    if (this.api.legacy) {
      const res = await this.api.get('/getNewRow', {query: {tableId: queryID}});
      if (res.ok) res.data = res.data.Cells;
      return res;
    } else {
      const res = await this.api.get('/channel/new-record', {query: {queryID}});
      if (res.ok) res.data = res.data.row;
      return res;
    }
  }

  /** Запрос на добавление записи в таблицу. */
  public async insertRows(queryID: QueryID, rows: ChannelRow[]): Promise<Res<OperationData>> {
    if (this.api.legacy) {
      const json = {tableId: queryID, rows: rows.map(toLegacyChannelRow)};
      return this.api.post('/insertRows', {json});
    } else {
      const res = await this.api.put('/channel/data', {query: {queryID}, json: {rows}});
      if (res.ok) res.data = {modifiedTables: res.data.modified.map(String)};
      return res;
    }
  }

  /** Запрос обновления записи в таблице. */
  public async updateRows(queryID: QueryID, indexes: number[], rows: ChannelRow[]): Promise<Res<OperationData>> {
    if (this.api.legacy) {
      const json = {tableId: queryID, indexes, rows: rows.map(toLegacyChannelRow)};
      return this.api.post('/updateRows', {json});
    } else {
      const res = await this.api.patch('/channel/data', {query: {queryID}, json: {indexes, data: rows}});
      if (res.ok) res.data = {modifiedTables: res.data.modified.map(String)};
      return res;
    }
  }

  /** Запрос на удаление записей из таблицы. */
  public async removeRows(queryID: QueryID, indexes: number[] | 'all'): Promise<Res<OperationData>> {
    if (this.api.legacy) {
      const query = {tableId: queryID, rows: Array.isArray(indexes) ? indexes.join(',') : indexes};
      return this.api.get('/removeRows', {query});
    } else {
      const res = await this.api.delete('/channel/data', {query: {queryID}, json: {indexes}});
      if (res.ok) res.data = {modifiedTables: res.data.modified.map(String)};
      return res;
    }
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
