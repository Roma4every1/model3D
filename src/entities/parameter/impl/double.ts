export class DoubleParameter implements Parameter<'double'> {
  public readonly id: ParameterID;
  public readonly name: ParameterName;
  public readonly type = 'double';
  private value: number | null;

  constructor(id: ParameterID, name: ParameterName, s: string | null) {
    this.id = id;
    this.name = name;
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

  public setValue(value: number | null): void {
    this.value = value;
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
