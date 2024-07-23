export class StringArrayParameter implements Parameter<'stringArray'> {
  public readonly id: ParameterID;
  public readonly name: ParameterName;
  public readonly type = 'stringArray';
  private value: string[] | null;

  constructor(id: ParameterID, name: ParameterName, s: string | null) {
    this.id = id;
    this.name = name;
    this.setValueString(s);
  }

  public clone(id?: ParameterID): StringArrayParameter {
    const clone = {...this, id: id ?? this.id};
    Object.setPrototypeOf(clone, StringArrayParameter.prototype);
    return clone;
  }

  public getValue(): string[] | null {
    return this.value;
  }

  public setValue(value: string[] | null): void {
    this.value = value;
  }

  public setValueString(s?: string | null): void {
    this.value = s ? s.split('|') : null;
  }

  public toString(): string | null {
    return this.Value();
  }

  /* --- --- */

  public Value(): string | null {
    if (this.value === null) return null;
    return this.value.join('|');
  }

  public CommaText(): string | null {
    if (this.value === null) return null;
    return this.value.join(',');
  }
}
