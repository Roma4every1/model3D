import { stringifyLocalDate } from 'shared/lib';


type DateInterval = ParameterValueMap['dateInterval'];

export class DateIntervalParameter implements Parameter<'dateInterval'> {
  public readonly id: ParameterID;
  public readonly type = 'dateInterval';
  public onDeepChange: ParameterOnDeepChange;
  private value: DateInterval;

  constructor(id: ParameterID, s: string | null) {
    this.id = id;
    this.setValueString(s);
  }

  public clone(): DateIntervalParameter {
    const clone = {...this};
    Object.setPrototypeOf(clone, DateIntervalParameter.prototype);
    return clone;
  }

  public getValue(): DateInterval | null {
    return this.value;
  }

  public setValue(value: DateInterval | null, deep?: boolean): void | Promise<void> {
    const oldValue = this.value;
    this.value = value;
    if (deep && this.onDeepChange) return this.onDeepChange(this, oldValue);
  }

  public setValueString(s?: string | null): void {
    if (!s) { this.value = null; return; }
    const [startString, endString] = s.split(' - ');

    let start = new Date(startString);
    let end = new Date(endString);
    if (Number.isNaN(start.getTime())) start = null;
    if (Number.isNaN(end.getTime())) end = null;

    if (start || end) {
      this.value = {start, end};
    } else {
      this.value = null;
    }
  }

  public toString(): string | null {
    return this.Value();
  }

  /* --- --- */

  public Value(): string | null {
    if (!this.value || !this.value.start || !this.value.end) return null;
    const startStr = stringifyLocalDate(this.value.start);
    const endStr = stringifyLocalDate(this.value.end);
    return startStr + ' - ' + endStr;
  }

  public ValueLocal(): string | null {
    if (!this.value || !this.value.start || !this.value.end) return null;
    return this.value.start.toLocaleDateString() + ' - ' + this.value.end.toLocaleDateString();
  }

  public ValueFrom(): string | null {
    if (!this.value || !this.value.start) return null;
    return stringifyLocalDate(this.value.start);
  }

  public ValueTo(): string | null {
    if (!this.value || !this.value.end) return null;
    return stringifyLocalDate(this.value.end);
  }

  public ValueFromLocal(): string | null {
    if (!this.value || !this.value.start) return null;
    return this.value.start.toLocaleDateString();
  }

  public ValueToLocal(): string | null {
    if (!this.value || !this.value.end) return null;
    return this.value.end.toLocaleDateString();
  }

  public ValueFromGMW(): string | null {
    if (!this.value || !this.value.start) return null;
    return stringifyLocalDate(this.value.start);
  }

  public ValueToGMW(): string | null {
    if (!this.value || !this.value.end) return null;
    return stringifyLocalDate(this.value.end);
  }

  public ValueFromNumber(): string | null {
    if (!this.value || !this.value.start) return null;
    return dateToNumbers(this.value.start);
  }

  public ValueToNumber(): string | null {
    if (!this.value || !this.value.end) return null;
    return dateToNumbers(this.value.end);
  }

  public DayFrom(): number | null {
    if (!this.value || !this.value.start) return null;
    return this.value.start.getDate();
  }

  public DayTo(): number | null {
    if (!this.value || !this.value.end) return null;
    return this.value.end.getDate();
  }

  public DayTwoDigitsFrom(): string | null {
    if (!this.value || !this.value.start) return null;
    const day = this.value.start.getDate();
    return day > 9 ? day.toString() : '0' + day;
  }

  public DayTwoDigitsTo(): string | null {
    if (!this.value || !this.value.end) return null;
    const day = this.value.end.getDate();
    return day > 9 ? day.toString() : '0' + day;
  }

  public MonthFrom(): number | null {
    if (!this.value || !this.value.start) return null;
    return this.value.start.getMonth() + 1;
  }

  public MonthTo(): number | null {
    if (!this.value || !this.value.end) return null;
    return this.value.end.getMonth() + 1;
  }

  public MonthTwoDigitsFrom(): string | null {
    if (!this.value || !this.value.start) return null;
    const month = this.value.start.getMonth() + 1;
    return month > 9 ? month.toString() : '0' + month;
  }

  public MonthTwoDigitsTo(): string | null {
    if (!this.value || !this.value.end) return null;
    const month = this.value.end.getMonth() + 1;
    return month > 9 ? month.toString() : '0' + month;
  }

  public MonthFromName(): string | null {
    if (!this.value || !this.value.start) return null;
    const name = this.value.start.toLocaleString('ru', {month: 'long'});
    return name[0].toUpperCase() + name.substring(1);
  }

  public MonthToName(): string | null {
    if (!this.value || !this.value.end) return null;
    const name = this.value.end.toLocaleString('ru', {month: 'long'});
    return name[0].toUpperCase() + name.substring(1);
  }

  public YearFrom(): number | null {
    if (!this.value || !this.value.start) return null;
    return this.value.start.getFullYear();
  }

  public YearTo(): number | null {
    if (!this.value || !this.value.end) return null;
    return this.value.end.getFullYear();
  }
}

/**
 * Приводит дату к формату `DDMMYYYY` без учёта временной зоны.
 * @example
 * dateToNumbers(new Date(2023, 6, 14)) => "14072023"
 * */
function dateToNumbers(date: Date): string {
  const month = date.getMonth() + 1;
  const monthString = month > 9 ? month : '0' + month;
  const day = date.getDate();
  const dayString = day > 9 ? day.toString() : '0' + day;
  return dayString + monthString + date.getFullYear();
}
