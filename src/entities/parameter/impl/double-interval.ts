type DoubleInterval = ParameterValueMap['doubleInterval'];

export class DoubleIntervalParameter implements Parameter<'doubleInterval'> {
  public readonly id: ParameterID;
  public readonly type = 'doubleInterval';
  public onDeepChange: ParameterOnDeepChange;
  private value: DoubleInterval | null;

  constructor(id: ParameterID, s: string | null) {
    this.id = id;
    this.setValueString(s);
  }

  public clone(): DoubleIntervalParameter {
    const clone = {...this};
    Object.setPrototypeOf(clone, DoubleIntervalParameter.prototype);
    return clone;
  }

  public getValue(): DoubleInterval | null {
    return this.value;
  }

  public setValue(value: DoubleInterval | null, deep?: boolean): void | Promise<void> {
    const oldValue = this.value;
    this.value = value;
    if (deep && this.onDeepChange) return this.onDeepChange(this, oldValue);
  }

  public setValueString(s?: string | null): void {
    if (!s) { this.value = null; return; }
    const [startString, endString] = s.split(' - ');

    let start = Number(startString);
    let end = Number(endString);
    if (Number.isNaN(start)) start = null;
    if (Number.isNaN(end)) end = null;

    if (start !== null || end !== null) {
      this.value = [start, end];
    } else {
      this.value = null;
    }
  }

  public toString(): string | null {
    return this.Value();
  }

  /* --- --- */

  public Value(): string | null {
    if (!this.value) return null;
    const [start, end] = this.value;
    if (start === null || end === null) return null;
    return `${start}->${end}`;
  }

  public ValueLocal(): string | null {
    if (!this.value) return null;
    const [start, end] = this.value;
    if (start === null || end === null) return null;
    return `${start}->${end}`.replaceAll('.', ',');
  }

  public ValueFrom(): string | null {
    if (!this.value || this.value[0] === null) return null;
    return this.value[0].toString();
  }

  public ValueTo(): string | null {
    if (!this.value || this.value[1] === null) return null;
    return this.value[1].toString();
  }

  public ValueFromLocal(): string | null {
    if (!this.value || this.value[0] === null) return null;
    return this.value[0].toString().replace('.', ',');
  }

  public ValueToLocal(): string | null {
    if (!this.value || this.value[1] === null) return null;
    return this.value[1].toString().replace('.', ',');
  }
}
