export class IntegerArrayParameter implements Parameter<'integerArray'> {
  public readonly id: ParameterID;
  public readonly name: ParameterName;
  public readonly type = 'integerArray';
  private value: number[] | null;

  constructor(id: ParameterID, name: ParameterName, s: string | null) {
    this.id = id;
    this.name = name;
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

  public setValue(value: number[] | null): void {
    this.value = value;
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
