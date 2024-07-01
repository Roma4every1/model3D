import { getDataTypeName } from 'shared/lib';
import { parseDBPrimitive } from '../lib/utils';


export function rowToParameterValue(row: ChannelRow, channel: Channel): Record<string, TypedCell> {
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

  private value: Record<string, TypedCell> | null;
  private valueString: string | null;

  constructor(id: ParameterID, name: ParameterName, s: string | null) {
    this.id = id;
    this.name = name;
    this.setValueString(s);
  }

  public clone(): TableRowParameter {
    const clone = {...this};
    Object.setPrototypeOf(clone, TableRowParameter.prototype);
    return clone;
  }

  public getValue(): Record<string, TypedCell> | null {
    return this.value;
  }

  public setValue(value: Record<string, TypedCell> | null): void {
    this.value = value;
    this.valueString = value ? this.createValueString() : null;
  }

  public setValueString(s?: string | null): void {
    if (!s) { this.value = null; this.valueString = null; return; }
    this.value = {};
    this.valueString = s;

    for (const item of s.split('|')) {
      const [field, value, type] = item.split('#');
      this.value[field] = {type, value: parseDBPrimitive(value, type)};
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
    if (dataType === 'null' || value === null) {
      return '';
    } else if (dataType === 'string') {
      return (value as string).replaceAll(/([#|])/g, '\\$1');
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
