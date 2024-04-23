export class BoolParameter implements Parameter<'bool'> {
  public readonly id: ParameterID;
  public readonly type = 'bool';
  public onDeepChange: ParameterOnDeepChange;
  private value: boolean | null;

  constructor(id: ParameterID, s: string | null) {
    this.id = id;
    this.setValueString(s);
  }

  public clone(): BoolParameter {
    const clone = {...this};
    Object.setPrototypeOf(clone, BoolParameter.prototype);
    return clone;
  }

  public getValue(): boolean | null {
    return this.value;
  }

  public setValue(value: boolean | null, deep?: boolean): void | Promise<void> {
    const oldValue = this.value;
    this.value = value;
    if (deep && this.onDeepChange) return this.onDeepChange(this, oldValue);
  }

  public setValueString(s?: string | null): void {
    if (!s) { this.value = null; return; }
    this.value = s.toLowerCase() === 'true' || s === '1';
  }

  public toString(): string {
    if (this.value === null) return null;
    return String(this.value);
  }

  /* --- --- */

  public Value(): boolean | null {
    return this.value;
  }

  public ValueInt(): number {
    if (this.value === null) return null;
    return this.value ? 1 : 0;
  }
}
