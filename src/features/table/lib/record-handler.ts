import { CSSProperties } from 'react';
import { RowErrors, RowStyleRule } from './types.ts';
import { createLookupList, createLookupTree } from 'entities/channels';
import { stringifyLocalDate, fixColorHEX } from 'shared/lib';


/** Условие, при выполнении которого у строки таблицы будут переопределены стили.  */
interface RecordStyleRule {
  /** Колонка, по которой проверяется выполнение условия. */
  column: TableColumnID;
  /** Тип колонки, по которой проверяется выполнение условия. */
  columnType?: TableColumnType;
  /** Значение, с которым сравнивается значение колонки. */
  compareValue: any;
  /** Исходное значение для сравнения, прописанное в конфиге. */
  sourceCompareValue: string | null;
  /** Переопределяемые CSS-свойства. */
  style: CSSProperties;
}


/** Класс, отвечающий работу с записями таблицы. */
export class RecordHandler implements ITableRecordHandler {
  private readonly styleRules: RecordStyleRule[] | null;
  private columnDict: TableColumnsState;
  private columnList: TableColumnState[];

  constructor(columns: TableColumnsState, rowStyles: RowStyleRule[] | null) {
    this.styleRules = rowStyles ? rowStyles.map(rowToRecordStyleRule) : null;
    this.columnDict = columns;
    this.columnList = Object.values(columns);
  }

  public setColumns(columns: TableColumnsState, channelColumns?: ChannelColumn[]): void {
    this.columnDict = columns;
    this.columnList = Object.values(columns);
    if (!this.styleRules || !channelColumns) return;

    for (const rule of this.styleRules) {
      if (rule.sourceCompareValue === null) continue;
      const columnState = this.columnDict[rule.column];
      const type = columnState.type;
      if (!type || rule.columnType === type) continue;
      rule.columnType = type;

      if (type === 'real' || channelColumns[columnState.colIndex].NetType.includes('Int')) {
        rule.compareValue = parseInt(rule.sourceCompareValue);
      } else if (type === 'date') {
        rule.compareValue = new Date(rule.sourceCompareValue).getTime();
      } else if (type === 'bool') {
        rule.compareValue = rule.sourceCompareValue === 'true' || rule.sourceCompareValue === '1';
      }
    }
  }

  /** Записывает данные справочников в состояние колонок. */
  public setLookupData(lookupData: ChannelDict): void {
    for (const column of this.columnList) {
      if (!column.lookupChannel) continue;
      const channel = lookupData[column.lookupChannel];
      const rows = channel.data?.rows;
      if (!rows?.length) { column.lookupData = []; column.lookupDict = {}; continue; }

      const columnsInfo = channel.info.lookupColumns;
      const isTree = columnsInfo.parent.index >= 0;
      if (isTree) column.type = 'tree';

      const [lookup, dict] = (isTree ? createLookupTree : createLookupList)(rows, columnsInfo);
      column.lookupData = lookup;
      column.lookupDict = dict;
    }
  }

  /* --- --- */

  /** Создаёт массив объектов данных для рендеринга в `Grid`. */
  public createRecords(data: ChannelData): TableRecord[] {
    if (!data?.rows.length) return [];
    return data.rows.map((row, i) => this.createRecord(i, row.Cells));
  }

  /** Создаёт модель записи для рендеринга в `Grid`. */
  public createRecord(id: TableRecordID, cells: any[]): TableRecord {
    const record: TableRecord = {id, cells};

    for (const column of this.columnList) {
      let value = cells[column.colIndex] ?? null;
      if (value !== null && column.type === 'date') value = new Date(value);
      record[column.field] = value;
    }
    if (this.styleRules) this.calcRecordStyle(record);
    return record;
  }

  /** Проверяет содержимое записи на корректность. */
  public validateRecord(record: TableRecord): RowErrors {
    const errors: RowErrors = [];
    for (const columnID in this.columnDict) {
      if (record[columnID] === null && this.columnDict[columnID].allowNull === false) {
        errors.push({type: 'null-value', columnID});
      }
    }
    return errors;
  }

  /** Возвращает исходное состояние записи. */
  public rollbackRecord(record: TableRecord): void {
    Object.assign(record, this.createRecord(record.id, record.cells));
    if (this.styleRules) this.calcRecordStyle(record);
  }

  /** Синхронизирует состояние оригинальных ячеек и состояние записи. */
  public applyRecordEdit(record: TableRecord): void {
    const cells = record.cells as any[];
    for (const column of this.columnList) {
      if (column.colIndex === -1) continue;
      let value = record[column.field];
      if (column.type === 'date' && value) value = stringifyLocalDate(value) + 'T00:00:00';
      cells[column.colIndex] = value;
    }
    if (this.styleRules) this.calcRecordStyle(record);
  }

  /* --- Private --- */

  private calcRecordStyle(record: TableRecord): void {
    for (const { column, columnType, compareValue, style } of this.styleRules) {
      let value = record[column] ?? null;
      if (value === compareValue) { record.style = style; break; }
      if (value) value = columnType === 'date' ? value.getTime() : value.toString();
      if (value === compareValue) { record.style = style; break; }
    }
  }
}

function rowToRecordStyleRule(rule: RowStyleRule): RecordStyleRule {
  const { propertyName: column, param, background, foreground } = rule;
  let compareValue = null;
  let style: CSSProperties;

  if (rule.type === 'equal' && param) {
    compareValue = param;
  }
  if (background || foreground) {
    style = {};
    if (foreground) style.color = fixColorHEX(foreground);
    if (background) style.backgroundColor = fixColorHEX(background);
  }
  return {column, compareValue, sourceCompareValue: compareValue, style};
}
