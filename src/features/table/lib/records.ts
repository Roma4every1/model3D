import { RowErrors } from './types';
import { createLookupList, createLookupTree } from 'entities/channels';


/** Записывает данные справочников в состояние колонок. */
export function applyLookupData(lookupData: ChannelDict, columns: TableColumnsState) {
  Object.values(columns).filter(c => c.lookupChannel).forEach((column) => {
    const channel = lookupData[column.lookupChannel];
    const rows = channel.data?.rows;
    if (!rows?.length) { column.lookupData = []; column.lookupDict = {}; return; }

    const columnsInfo = channel.info.lookupColumns;
    const isTree = columnsInfo.parent.index >= 0;
    if (isTree) column.type = 'tree';

    const [lookup, dict] = (isTree ? createLookupTree : createLookupList)(rows, columnsInfo);
    column.lookupData = lookup;
    column.lookupDict = dict;
  });
}

/* --- --- */

/** Создаёт массив объектов данных для рендеринга в `Grid`. */
export function createRecords(data: ChannelData, columns: TableColumnsState): TableRecord[] {
  if (!data?.rows.length) return [];
  const columnsArray = Object.values(columns);
  return data.rows.map((row, i) => createRecord(i, row.Cells, columnsArray));
}

/** Создаёт модель записи для рендеринга в `Grid`. */
export function createRecord(id: TableRecordID, cells: any[], columns: TableColumnState[]) {
  const result: Record<string, any> = {id, cells};

  for (const column of columns) {
    let value = cells[column.colIndex] ?? null;

    if (value !== null) {
      const type = column.type;
      if (type === 'date') {
        value = new Date(value);
      } else if (type === 'real') {
        if (typeof value === 'string') value = parseFloat(value.replace(',', '.'));
      }
    }
    result[column.field] = value;
  }
  return result;
}

/** Возвращает исходное состояние записи. */
export function rollbackRecord(record: TableRecord, columns: TableColumnsState) {
  const columnsArray = Object.values(columns);
  Object.assign(record, createRecord(record.id, record.cells, columnsArray));
}

/** Синхронизирует состояние оригинальных ячеек и состояние записи. */
export function applyRecordEdit(record: TableRecord, columns: TableColumnsState) {
  const cells = record.cells as any[];
  for (const column of Object.values(columns)) {
    if (column.colIndex === -1) continue;
    let value = record[column.field];
    if (column.type === 'date' && value) value = value.toJSON();
    cells[column.colIndex] = value;
  }
}

/** Проверяет содержимое записи на корректность. */
export function validateRecord(record: TableRecord, columns: TableColumnsState): RowErrors {
  const errors: RowErrors = [];
  for (const columnID in columns) {
    if (record[columnID] === null && columns[columnID].allowNull === false)
      errors.push({type: 'null-value', columnID});
  }
  return errors;
}
