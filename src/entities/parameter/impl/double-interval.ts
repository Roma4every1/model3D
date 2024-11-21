type DoubleInterval = ParameterValueMap['doubleInterval'];

export class DoubleIntervalParameter implements Parameter<'doubleInterval'> {
  public readonly id: ParameterID;
  public readonly name: ParameterName;
  public readonly type = 'doubleInterval';
  private value: DoubleInterval | null;

  constructor(id: ParameterID, name: ParameterName, s: string | null) {
    this.id = id;
    this.name = name;
    this.setValueString(s);
  }

  public clone(id?: ParameterID): DoubleIntervalParameter {
    const clone = {...this, id: id ?? this.id};
    Object.setPrototypeOf(clone, DoubleIntervalParameter.prototype);
    return clone;
  }

  public getValue(): DoubleInterval | null {
    return this.value;
  }

  public setValue(value: DoubleInterval | null): void {
    this.value = value;
  }

  public setValueString(s?: string | null): void {
    if (!s) { this.value = null; return; }
    const [startString, endString] = s.split('->');
    let start: number | null = null;
    let end: number | null = null;

    if (startString) {
      start = Number(startString);
      if (Number.isNaN(end)) end = null;
    }
    if (endString) {
      end = Number(endString)
      if (Number.isNaN(start)) start = null;
    }
    if (start !== null || end !== null) {
      this.value = [start, end];
    } else {
      this.value = null;
    }
  }

  public toString(): string | null {
    if (!this.value) return null;
    const [start, end] = this.value;

    if (start !== null) {
      return end !== null ? start + '->' + end : start + '->';
    } else {
      return end !== null ? '->' + end : null;
    }
  }

  /* --- --- */

  public Value(): string | null {
    return this.toString();
  }

  public ValueLocal(): string | null {
    return this.toString()?.replaceAll('.', ',') ?? null;
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
