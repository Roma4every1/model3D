import { splitByFirstOccurrence } from 'shared/lib';
import { parseDBPrimitive } from '../lib/utils';


export function cellToParameterValue(row: ChannelRow, channel: Channel): TypedCell {
  const idIndex = channel.config.lookupColumns.id.columnIndex;
  const value = row[idIndex];
  const type = value === null ? 'System.DBNull' : channel.data.columns[idIndex].type;
  return {type, value};
}

export class TableCellParameter implements Parameter<'tableCell'> {
  public readonly id: ParameterID;
  public readonly name: ParameterName;
  public readonly type = 'tableCell';
  private value: TypedCell;

  constructor(id: ParameterID, name: ParameterName, s: string | null) {
    this.id = id;
    this.name = name;
    this.setValueString(s);
  }

  public clone(id?: ParameterID): TableCellParameter {
    const clone = {...this, id: id ?? this.id};
    Object.setPrototypeOf(clone, TableCellParameter.prototype);
    return clone;
  }

  public getValue(): TypedCell | null {
    return this.value;
  }

  public setValue(value: TypedCell | null): void {
    this.value = value;
  }

  public setValueString(s?: string | null): void {
    if (!s) { this.value = null; return; }
    const [value, type] = splitByFirstOccurrence(s, '#');
    this.value = {type, value: parseDBPrimitive(value, type)};
  }

  public toString(): string | null {
    if (this.value === null) return null;
    return this.value.value + '#' + this.value.type;
  }

  /* --- --- */

  public Value(): any {
    return this.value?.value ?? null;
  }

  public ValueLocal(): any {
    return this.value?.value ?? null;
  }
}
