export class StringParameter implements Parameter<'string'> {
  public readonly id: ParameterID;
  public readonly type = 'string';
  public onDeepChange: ParameterOnDeepChange;
  private value: string | null;

  constructor(id: ParameterID, s: string | null) {
    this.id = id;
    this.setValueString(s);
  }

  public clone(): StringParameter {
    const clone = {...this};
    Object.setPrototypeOf(clone, StringParameter.prototype);
    return clone;
  }

  public getValue(): string | null {
    return this.value;
  }

  public setValue(value: string | null, deep?: boolean): void | Promise<void> {
    const oldValue = this.value;
    this.value = value;
    if (deep && this.onDeepChange) return this.onDeepChange(this, oldValue);
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
