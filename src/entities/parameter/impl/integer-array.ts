export class IntegerArrayParameter implements Parameter<'integerArray'> {
  public readonly id: ParameterID;
  public readonly type = 'integerArray';
  public onDeepChange: ParameterOnDeepChange;
  private value: number[] | null;

  constructor(id: ParameterID, s: string | null) {
    this.id = id;
    this.setValueString(s);
  }

  public clone(): IntegerArrayParameter {
    const clone = {...this};
    Object.setPrototypeOf(clone, IntegerArrayParameter.prototype);
    return clone;
  }

  public getValue(): number[] | null {
    return this.value;
  }

  public setValue(value: number[] | null, deep?: boolean): void | Promise<void> {
    const oldValue = this.value;
    this.value = value;
    if (deep && this.onDeepChange) return this.onDeepChange(this, oldValue);
  }

  public setValueString(s?: string | null): void {
    if (!s) { this.value = null; return; }
    const parse = (s: string): number | null => {
      const n = Number(s);
      return Number.isNaN(n) ? null : Math.round(n);
    };
    this.value = s.split(',').map(parse).filter(Boolean);
  }

  public toString(): string | null {
    return this.CommaValue();
  }

  /* --- --- */

  public CommaValue(): string | null {
    return this.value?.join(',') ?? null;
  }

  public DashValue(): string | null {
    return this.value?.join('---') ?? null;
  }
}
