import type { TableColumnModel, RecordStyleRule, RecordViolation } from './types';
import { parseDate, stringifyLocalDate, getDataTypeName, fixColorHEX } from 'shared/lib';
import { createLookupList, createLookupTree } from 'entities/channel';
import { TableColumns } from './table-columns';
import { toTableColumnType, formatFloat } from './utils';
import { createColumnFilter } from './filter-utils';


/** Обёртка для данных таблицы. */
export class TableData {
  /** Колонки таблицы. */
  private readonly columns: TableColumns;
  /** Правила раскраски записей. */
  public readonly styleRules: RecordStyleRule[];

  /** Массив записей. */
  public records: TableRecord[];
  /** ID для API редактирования записей. */
  public queryID: QueryID;
  /** Являются ли записи редактируемыми. */
  public editable: boolean;
  /** Флаг того, что канал наполнен частично. */
  public dataPart: boolean;
  /** Информация об активной ячейке. */
  public readonly activeCell: TableActiveCell;

  constructor(columns: TableColumns, styleRules: RecordStyleRule[]) {
    this.columns = columns;
    this.styleRules = styleRules;
    this.records = [];
    this.queryID = null;
    this.editable = false;
    this.dataPart = false;
    this.activeCell = {row: null, column: null, edited: false};
  }

  public setChannelData(data: ChannelData): void {
    if (!data) {
      this.records = []; this.queryID = null;
      this.editable = false; this.dataPart = false;
      this.columns.updateAutoWidth(this.records);
      this.activeCell.edited = false; return;
    }
    for (const column of this.columns.list) {
      const channelColumnName = column.property.fromColumn;
      const index = data.columns.findIndex(c => c.name === channelColumnName);
      column.columnIndex = index;

      if (index === -1) { column.nullable = true; continue; }
      const channelColumn = data.columns[index];
      const dataType = getDataTypeName(channelColumn.type);

      if (column.lookupChannel) {
        if (!column.type) column.type = 'list';
      } else if (column.typeFormat === 'Color' && dataType === 'string') {
        column.type = 'color';
      } else {
        column.type = toTableColumnType(dataType);
      }
      if (column.formatter && column.type !== 'real' && column.type !== 'int') {
        column.formatter = undefined;
      }
      if (!column.filter) {
        column.filter = createColumnFilter(column.type);
      } else {
        column.filter.uniqueValues = undefined;
      }
      column.columnName = channelColumn.name;
      column.dataType = dataType;
      column.nullable = channelColumn.nullable;
    }
    this.updateStyleRules();

    this.records = data.rows.map((row, i) => this.createRecord(i, i, row));
    this.queryID = data.queryID;
    this.editable = data.editable;
    this.dataPart = data.dataPart;
    this.columns.updateAutoWidth(this.records);
    this.activeCell.edited = false;
  }

  /** Записывает данные справочников в состояние колонок. */
  public setLookupData(lookupData: ChannelDict): void {
    for (const column of this.columns.list) {
      if (!column.lookupChannel) continue;
      const { config, data } = lookupData[column.lookupChannel];

      const rows = data?.rows;
      if (!rows?.length) { column.lookupData = []; column.lookupDict = {}; continue; }
      if (column.lookupQueryID === data.queryID) continue;

      const lookupColumns = config.lookupColumns;
      const isTree = lookupColumns.parent.columnIndex >= 0;
      if (isTree) column.type = 'tree';

      const [lookup, dict] = (isTree ? createLookupTree : createLookupList)(rows, lookupColumns);
      column.lookupData = lookup;
      column.lookupDict = dict;
      column.lookupQueryID = data.queryID;
    }
  }

  public setActiveCell(cell: TableActiveCell | null): void {
    if (cell) {
      this.activeCell.row = cell.row;
      this.activeCell.column = cell.column;
      if (cell.edited !== undefined) this.activeCell.edited = cell.edited;
    } else {
      this.activeCell.row = null;
      this.activeCell.column = null;
      this.activeCell.edited = false;
    }
  }

  /** Находит уникальные значения в ячейках колонки. */
  public getUniqueValues(col: PropertyName): any[] {
    const set: Set<any> = new Set();
    const index = this.columns.dict[col].columnIndex;

    for (const record of this.records) {
      set.add(record.cells[index]);
    }
    set.delete(null);
    return [...set];
  }

  /* --- Editing --- */

  /** Добавляет новую запись в датасет. */
  public add(index: number, cells: ChannelRow): void {
    const record = this.createRecord(-1, index, cells);
    this.records.splice(index, 0, record);
    this.records.forEach((r: TableRecord, i: number) => { r.index = i; });
  }

  /** Удаляет запись по её индексу. */
  public delete(index: number): void {
    this.records.splice(index, 1);
    this.records.forEach((r: TableRecord, i: number) => { r.index = i; });
  }

  /** Задаёт значение для конкретной ячейки. */
  public setCellValue(row: number, col: PropertyName, value: any): void {
    const column = this.columns.dict[col];
    const columnIndex = column.columnIndex;
    if (columnIndex === -1) return;

    const record = this.records[row];
    const cells = record.cells;
    if (cells[columnIndex] === value) return;

    if (!record.initCells) {
      record.initCells = cells;
      record.cells = [...cells];
    }
    record.cells[columnIndex] = value;
    record.renderValues[col] = this.getCellRenderValue(column, record.cells);
    if (this.styleRules.length) this.calcRecordStyle(record);
  }

  /** Проверяет содержимое записи на корректность. */
  public validateRecord(record: TableRecord): RecordViolation[] {
    const errors: RecordViolation[] = [];
    for (const column of this.columns.list) {
      if (column.nullable === true) continue;
      const value = record.cells[column.columnIndex];
      if (value === null) errors.push({type: 'null-value', column: column.id});
    }
    return errors;
  }

  /** Сохраняет измененённые значения. */
  public commitRecord(record: TableRecord): void {
    delete record.initCells;
  }

  /** Возвращает исходное состояние записи. */
  public rollbackRecord(record: TableRecord): void {
    const { initCells, renderValues } = record;
    if (!initCells) return;
    record.cells = initCells;
    delete record.initCells;

    for (const column of this.columns.list) {
      renderValues[column.id] = this.getCellRenderValue(column, initCells);
    }
    if (this.styleRules.length) this.calcRecordStyle(record);
  }

  /** Проверяет, принадлежит ли запись исходному датасету. */
  public isNewRecord(arg: TableRecord | number | null): boolean {
    const record = typeof arg === 'number' ? this.records[arg] : arg;
    return record && record.id === -1;
  }

  /* --- Editing Utils --- */

  private createRecord(id: TableRecordID, index: number, cells: ChannelRow): TableRecord {
    const renderValues: Record<PropertyName, CellRenderValue> = {};
    const record: TableRecord = {id, index, cells, renderValues};

    for (const column of this.columns.list) {
      renderValues[column.id] = this.getCellRenderValue(column, cells);
    }
    if (this.styleRules.length) this.calcRecordStyle(record);
    return record;
  }

  private getCellRenderValue(column: TableColumnModel, cells: ChannelRow): CellRenderValue {
    if (column.fileColumn) {
      const value = cells[this.columns.dict[column.fileColumn].columnIndex];
      return typeof value === 'string' ? value : null;
    }
    let value = cells[column.columnIndex];
    if (value === null || value === undefined) return null;
    if (column.formatter) return column.formatter(value);
    const type = column.type;

    if (type === 'real') {
      return formatFloat(value, 0, 3);
    }
    if (type === 'list' || type === 'tree') {
      value = column.lookupDict[value];
      return value === null || value === undefined ? null : String(value);
    }
    if (type === 'date') return new Date(value).toLocaleDateString();
    if (type === 'bool') return value ? '✔' : '✖';

    if (type === 'color') {
      if (value.charCodeAt(0) !== 0x23) value = '#' + value;
      return fixColorHEX(value);
    }
    if (column.dataType === 'blob') return null;
    return String(value);
  }

  /* --- Style Rules --- */

  private calcRecordStyle(record: TableRecord): void {
    for (const rule of this.styleRules) {
      const column = this.columns.dict[rule.property];
      const cellValue = record.cells[column.columnIndex];
      if (cellValue === rule.compareValue) { record.style = rule.style; break; }
    }
  }

  private updateStyleRules(): void {
    for (const rule of this.styleRules) {
      if (rule.sourceCompareValue === null) continue;
      const dataType = this.columns.dict[rule.property].dataType;
      if (!dataType || rule.dataType === dataType) continue;
      rule.dataType = dataType;

      const code = dataType.charCodeAt(0);
      if (code === 0x69 /* i */ || code === 0x75 /* u */) {
        rule.compareValue = Number.parseInt(rule.sourceCompareValue);
      } else if (code === 0x66 /* f */) {
        rule.compareValue = Number.parseFloat(rule.sourceCompareValue);
      } else if (code === 0x64 /* d */) {
        const date = parseDate(rule.sourceCompareValue);
        if (date) rule.compareValue = stringifyLocalDate(date) + 'T00:00:00';
      } else if (code === 0x62 /* d */ && dataType.length === 7) {
        rule.compareValue = rule.sourceCompareValue === 'true' || rule.sourceCompareValue === '1';
      }
    }
  }
}
