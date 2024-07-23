import { stringifyLocalDate } from 'shared/lib';


export class DateParameter implements Parameter<'date'> {
  public readonly id: ParameterID;
  public readonly name: ParameterName;
  public readonly type = 'date';
  private value: Date | null;

  constructor(id: ParameterID, name: ParameterName, s: string | null) {
    this.id = id;
    this.name = name;
    this.setValueString(s);
  }

  public clone(id?: ParameterID): DateParameter {
    const clone = {...this, id: id ?? this.id};
    Object.setPrototypeOf(clone, DateParameter.prototype);
    return clone;
  }

  public getValue(): Date | null {
    return this.value;
  }

  public setValue(value: Date | null): void {
    this.value = value;
  }

  public setValueString(s?: string | null): void {
    if (!s) { this.value = null; return; }
    this.value = new Date(s);
    if (Number.isNaN(this.value.getTime())) this.value = null;
  }

  public toString(): string | null {
    if (this.value === null) return null;
    return stringifyLocalDate(this.value);
  }

  /* --- --- */

  public Value(): string | null {
    if (this.value === null) return null;
    return stringifyLocalDate(this.value);
  }

  public ValueLocal(): string | null {
    if (this.value === null) return null;
    return this.value.toLocaleDateString();
  }

  public Year(): number | null {
    if (this.value === null) return null;
    return this.value.getFullYear();
  }

  public Month(): number | null {
    if (this.value === null) return null;
    return this.value.getMonth() + 1;
  }

  public MonthTwoDigits(): string | null {
    if (this.value === null) return null;
    const month = this.value.getMonth() + 1;
    return month > 9 ? month.toString() : '0' + month;
  }

  public MonthName(): string | null {
    if (this.value === null) return null;
    const name = this.value.toLocaleString('ru', {month: 'long'});
    return name[0].toUpperCase() + name.substring(1);
  }

  public MonthNameLower(): string | null {
    if (this.value === null) return null;
    return this.value.toLocaleString('ru', {month: 'long'});
  }

  public Day(): number | null {
    if (this.value === null) return null;
    return this.value.getDate();
  }

  public DayTwoDigits(): string | null {
    if (this.value === null) return null;
    const day = this.value.getDate();
    return day > 9 ? day.toString() : '0' + day;
  }

  public ValueGMW(): string | null {
    if (this.value === null) return null;
    return stringifyLocalDate(this.value);
  }

  public ValueGMW3D(): string | null {
    if (this.value === null) return null;
    const month = this.value.getMonth() + 1;
    const monthString = month > 9 ? month : '0' + month;
    const day = this.value.getDate();
    const dayString = day > 9 ? day.toString() : '0' + day;
    return dayString + monthString + this.value.getFullYear();
  }
}
