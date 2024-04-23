export class IntegerParameter implements Parameter<'integer'> {
  public readonly id: ParameterID;
  public readonly type = 'integer';
  public onDeepChange: ParameterOnDeepChange;
  private value: number | null;

  constructor(id: ParameterID, s: string | null) {
    this.id = id;
    this.setValueString(s);
  }

  public clone(): IntegerParameter {
    const clone = {...this};
    Object.setPrototypeOf(clone, IntegerParameter.prototype);
    return clone;
  }

  public getValue(): number | null {
    return this.value;
  }

  public setValue(value: number | null, deep?: boolean): void | Promise<void> {
    const oldValue = this.value;
    this.value = value;
    if (deep && this.onDeepChange) return this.onDeepChange(this, oldValue);
  }

  public setValueString(s?: string | null): void {
    if (!s) { this.value = null; return; }
    this.value = Number(s);
    if (Number.isNaN(this.value)) this.value = null;
    this.value = Math.round(this.value);
  }

  public toString(): string | null {
    return this.value?.toString() ?? null;
  }

  /* --- --- */

  public Value(): number | null {
    return this.value;
  }
}
