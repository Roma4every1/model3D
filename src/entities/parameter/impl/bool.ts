export class BoolParameter implements Parameter<'bool'> {
  public readonly id: ParameterID;
  public readonly name: ParameterName;
  public readonly type = 'bool';
  private value: boolean | null;

  constructor(id: ParameterID, name: ParameterName, s: string | null) {
    this.id = id;
    this.name = name;
    this.setValueString(s);
  }

  public clone(id?: ParameterID): BoolParameter {
    const clone = {...this, id: id ?? this.id};
    Object.setPrototypeOf(clone, BoolParameter.prototype);
    return clone;
  }

  public getValue(): boolean | null {
    return this.value;
  }

  public setValue(value: boolean | null): void {
    this.value = value;
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
