export class StringArrayParameter implements Parameter<'stringArray'> {
  public readonly id: ParameterID;
  public readonly type = 'stringArray';
  public onDeepChange: ParameterOnDeepChange;
  private value: string[] | null;

  constructor(id: ParameterID, s: string | null) {
    this.id = id;
    this.setValueString(s);
  }

  public clone(): StringArrayParameter {
    const clone = {...this};
    Object.setPrototypeOf(clone, StringArrayParameter.prototype);
    return clone;
  }

  public getValue(): string[] | null {
    return this.value;
  }

  public setValue(value: string[] | null, deep?: boolean): void | Promise<void> {
    const oldValue = this.value;
    this.value = value;
    if (deep && this.onDeepChange) return this.onDeepChange(this, oldValue);
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
