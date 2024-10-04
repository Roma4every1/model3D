import type { KeyboardEvent } from 'react';
import type { TableColumnModel, ColumnFormatter, TableActions } from './types';
import { measureText } from 'shared/drawing';
import { cellFont, maxCellWidth } from './constants';


/** Приведение к типу колонки таблицы по типу колонки канала. */
export function toTableColumnType(dataType: DataTypeName): TableColumnType {
  if (!dataType) return 'text';
  const code = dataType.charCodeAt(0);

  if (code === 0x69 /* i */ || code === 0x75 /* u */) return 'int';
  if (code === 0x66 /* f */) return 'real';
  if (code === 0x64 /* d */) return 'date';
  if (code === 0x62 /* d */ && dataType.length === 7) return 'bool';
  return 'text';
}

/** Нахождение оптимальной ширины колонки с учётом наполнения таблицы. */
export function calcColumnAutoWidth(column: TableColumnModel, records: TableRecord[]): number {
  const titleWidth = measureText(column.displayName, cellFont);
  let dataWidth = 0;

  if (records.length > 0) {
    if (column.type === 'date') {
      dataWidth = 75;
    } else if (column.type === 'bool') {
      dataWidth = 20;
    } else if (column.type === 'color') {
      dataWidth = 40;
    } else {
      dataWidth = calcLongestCellWidth(column, records);
    }
  }
  if (column.detailChannel) {
    dataWidth += 20;
  }
  return Math.min(maxCellWidth, Math.max(titleWidth + 18, dataWidth) + 14);
}

function calcLongestCellWidth(column: TableColumnModel, records: TableRecord[]): number {
  let max = 0;
  const id = column.id;

  for (const record of records) {
    const value = record.renderValues[id];
    if (!value) continue;
    const width = measureText(value, cellFont);
    if (width > max) max = width;
  }
  return max;
}

export function createColumnFormatter(format: string): ColumnFormatter | undefined {
  let match: RegExpMatchArray = format.match(/^[np](\d+)?$/);
  if (match) {
    const digits = match[1] ? Number.parseInt(match[1]) : 0;
    if (match[0].charCodeAt(0) === 0x6E /* 'n' */) {
      return (n: number) => n.toFixed(digits).replace('.', ',');
    } else {
      return (n: number) => (n * 100).toFixed(digits).replace('.', ',') + '%';
    }
  }
  match = format.match(/^[0#](?:\.(0*#+|0+#*))?$/);
  if (!match) return undefined;

  const fractionPart = match[1];
  if (!fractionPart) return (n: number) => n.toFixed();

  const minDigits = fractionPart.lastIndexOf('0') + 1;
  const maxDigits = fractionPart.length;
  return (n: number) => formatFloat(n, minDigits, maxDigits);
}

/**
 * Форматирует число, чтобы в записи было не менее `minDigits`
 * и не более `maxDigits` знаков после запятой.
 */
function formatFloat(n: number, minDigits: number, maxDigits: number): string {
  let str = n.toFixed(maxDigits);
  const maxRedundant = maxDigits - minDigits;

  let redundant = 0;
  let charIndex = str.length - 1;

  while (redundant !== maxRedundant) {
    if (str.charCodeAt(charIndex) !== 0x30 /* '0' */) break;
    ++redundant; --charIndex;
  }
  if (redundant > 0) {
    let end = str.length - redundant;
    if (str.charCodeAt(end - 1) === 0x2E /* '.' */) return str.substring(0, end - 1);
    str = str.substring(0, end);
  }
  return str.replace('.', ',');
}

/**
 * Обрабатывает событие `keydown` в редакторе ячейки, имеющей поле для ввода.
 *
 * Обрабатываются только клавиши горизонтальной навигации, исключая конфликты
 * для слушателя таблицы и ячейки. Функция может вызвать `.stopPropagation()`.
 */
export function handleCellInputKeydown(e: KeyboardEvent, actions: TableActions): void {
  const key = e.nativeEvent.key;
  const input = e.target as HTMLInputElement;
  const { selectionStart, selectionEnd } = input;
  if (selectionStart !== selectionEnd) return;

  if (key === 'Home') {
    if (selectionStart === 0) {
      actions.moveCellHorizontal(undefined, 0);
    } else {
      input.setSelectionRange(0, 0);
    }
    return e.stopPropagation();
  }
  if (key === 'End') {
    const valueLength = input.value.length;
    if (selectionEnd === valueLength) {
      actions.moveCellHorizontal(undefined, -1);
    } else {
      input.setSelectionRange(valueLength, valueLength);
    }
    return e.stopPropagation();
  }
  if (key === 'ArrowLeft' && selectionStart === 0) {
    actions.moveCellHorizontal(-1);
    return e.stopPropagation();
  }
  if (key === 'ArrowRight' && selectionEnd === input.value.length) {
    actions.moveCellHorizontal(1);
    return e.stopPropagation();
  }
}
