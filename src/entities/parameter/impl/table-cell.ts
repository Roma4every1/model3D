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
  public readonly type = 'tableCell';
  public onDeepChange: ParameterOnDeepChange;
  private value: TypedCell;

  constructor(id: ParameterID, s: string | null) {
    this.id = id;
    this.setValueString(s);
  }

  public clone(): TableCellParameter {
    const clone = {...this};
    Object.setPrototypeOf(clone, TableCellParameter.prototype);
    return clone;
  }

  public getValue(): TypedCell | null {
    return this.value;
  }

  public setValue(value: TypedCell | null, deep?: boolean): void | Promise<void> {
    const oldValue = this.value;
    this.value = value;
    if (deep && this.onDeepChange) return this.onDeepChange(this, oldValue);
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
