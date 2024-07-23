export class StringParameter implements Parameter<'string'> {
  public readonly id: ParameterID;
  public readonly name: ParameterName;
  public readonly type = 'string';
  private value: string | null;

  constructor(id: ParameterID, name: ParameterName, s: string | null) {
    this.id = id;
    this.name = name;
    this.setValueString(s);
  }

  public clone(id?: ParameterID): StringParameter {
    const clone = {...this, id: id ?? this.id};
    Object.setPrototypeOf(clone, StringParameter.prototype);
    return clone;
  }

  public getValue(): string | null {
    return this.value;
  }

  public setValue(value: string | null): void {
    this.value = value;
  }

  public setValueString(s?: string | null): void {
    if (s === undefined) s = null;
    this.value = s;
  }

  public toString(): string | null {
    return this.value;
  }

  /* --- --- */

  public Value(): string | null {
    return this.value;
  }

  public ValueXml(): string | null {
    if (this.value === null) return null;
    return this.value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;');
  }
}
