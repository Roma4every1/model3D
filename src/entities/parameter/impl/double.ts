export class DoubleParameter implements Parameter<'double'> {
  public readonly id: ParameterID;
  public readonly type = 'double';
  public onDeepChange: ParameterOnDeepChange;
  private value: number | null;

  constructor(id: ParameterID, s: string | null) {
    this.id = id;
    this.setValueString(s);
  }

  public clone(): DoubleParameter {
    const clone = {...this};
    Object.setPrototypeOf(clone, DoubleParameter.prototype);
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
  }

  public toString(): string | null {
    return this.value?.toString() ?? null;
  }

  /* --- --- */

  public Value(): number | null {
    return this.value;
  }

  public ValueLocal(): string | null {
    if (this.value === null) return null;
    return this.value.toString().replace('.', ',');
  }
}
