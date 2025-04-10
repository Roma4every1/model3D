import { fetcher } from 'shared/lib';
import { getDataTypeName, stringifyLocalDate } from 'shared/lib';
import { parseDBPrimitive } from '../lib/utils';


export function rowToParameterValue(row: ChannelRow, channel: Channel): TableRowValue {
  const value: Record<string, TypedCell> = {};
  const properties = channel.config.properties;

  channel.data?.columns.forEach(({name, type}: ChannelColumn, i: number) => {
    const cellValue = row[i];
    const cell = {type: cellValue === null ? 'System.DBNull' : type, value: cellValue};
    value[name] = cell;

    const property = properties.find(p => p.fromColumn === name);
    if (property) value[property.name] = cell;
  });
  return value;
}

export class TableRowParameter implements Parameter<'tableRow'> {
  public readonly id: ParameterID;
  public readonly name: ParameterName;
  public readonly type = 'tableRow';

  private value: TableRowValue | null;
  private valueString: string | null;

  constructor(id: ParameterID, name: ParameterName, s: string | null) {
    this.id = id;
    this.name = name;
    this.setValueString(s);
  }

  public clone(id?: ParameterID): TableRowParameter {
    const clone = {...this, id: id ?? this.id};
    Object.setPrototypeOf(clone, TableRowParameter.prototype);
    return clone;
  }

  public getValue(): TableRowValue | null {
    return this.value;
  }

  public setValue(value: TableRowValue | null): void {
    this.value = value;
    this.valueString = value ? this.createValueString() : null;
  }

  public setValueString(s?: string | null): void {
    if (!s) { this.value = null; this.valueString = null; return; }
    this.value = {};
    this.valueString = s;

    if (fetcher.version) {
      for (const item of splitWithEscape(s, '|')) {
        const [field, rawValue, type] = splitWithEscape(item, '#');
        const value = rawValue.replace(/\\(.)/g, '$1');
        this.value[field] = {type, value: parseDBPrimitive(value, type)};
      }
    } else {
      for (const item of s.split('|')) {
        const [field, value, type] = item.split('#');
        this.value[field] = {type, value: parseDBPrimitive(value, type)};
      }
    }
  }

  public toString(): string | null {
    return this.valueString;
  }

  private createValueString(): string {
    const parts: string[] = [];
    for (const field in this.value) {
      const cell = this.value[field];
      parts.push(field, '#', this.handleValue(cell), '#', cell.type, '|');
    }
    parts.pop();
    return parts.join('');
  }

  private handleValue({type, value}: TypedCell): string {
    const dataType = getDataTypeName(type);
    if (dataType === 'null' || value === null) return '';

    if (dataType === 'string') {
      return (value as string).replaceAll(/([#|\\])/g, '\\$1');
    }
    if (dataType === 'date' && value instanceof Date) {
      return stringifyLocalDate(value);
    }
    return String(value);
  }

  /* --- --- */

  public Value(): any {
    if (!this.value) return null;
    return this.value['LOOKUPVALUE'].value ?? null;
  }

  public Code(): any {
    if (!this.value) return null;
    return this.value['LOOKUPCODE'].value ?? null;
  }

  public CellValue(field: string): any {
    if (!field || !this.value) return null;
    return this.value[field].value ?? null;
  }

  public CellValueLocal(field: string): any {
    if (!field || !this.value) return null;
    return this.value[field].value ?? null;
  }
}

/**
 * Разбивает строку по символу разделителя (так же, ка и метод строки `split`),
 * рассматривая символ `\` как отменяющий специальное действие следующего символа.
 */
function splitWithEscape(input: string, sep: string): string[] {
  const result: string[] = [];
  const sepCode = sep.charCodeAt(0);

  let prev = 0;
  const len = input.length;

  for (let i = 0; i < len; ++i) {
    const iCode = input.charCodeAt(i);
    if (iCode === 0x5C /* \ */) {
      ++i;
    } else if (iCode === sepCode) {
      result.push(input.substring(prev, i));
      prev = i + 1;
    }
  }
  if (prev <= len) result.push(input.substring(prev));
  return result;
}
