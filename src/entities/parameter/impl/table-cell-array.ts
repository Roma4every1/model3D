import { splitByFirstOccurrence } from 'shared/lib';
import { parseDBPrimitive } from '../lib/utils';


export class TableCellArrayParameter implements Parameter<'tableCellsArray'> {
  public readonly id: ParameterID;
  public readonly name: ParameterName;
  public readonly type = 'tableCellsArray';
  private value: TypedCell[] | null;

  constructor(id: ParameterID, name: ParameterName, s: string | null) {
    this.id = id;
    this.name = name;
    this.setValueString(s);
  }

  public clone(): TableCellArrayParameter {
    const clone = {...this};
    Object.setPrototypeOf(clone, TableCellArrayParameter.prototype);
    return clone;
  }

  public getValue(): TypedCell[] | null {
    return this.value;
  }

  public setValue(value: TypedCell[] | null): void {
    this.value = value;
  }

  public setValueString(s?: string | null): void {
    if (!s) { this.value = null; return; }
    const valueStrings = s.split('|');

    this.value = valueStrings.map((valueString): TypedCell => {
      const [type, value] = splitByFirstOccurrence(valueString, '#');
      return {type, value: parseDBPrimitive(value, type)}
    });
  }

  public toString(): string | null {
    if (this.value === null) return null;
    return this.value.map((cell: TypedCell) => cell.value + '#' + cell.type).join('|');
  }
}
