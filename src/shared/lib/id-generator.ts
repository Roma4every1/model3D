/**
 * Класс, генерирующий целочисленные идентификаторы в порядке возрастания.
 * Идентификаторы начинаются с номера (start), указанного при создании экземпляра.
 */
export class IDGenerator {
  private readonly start: number;
  private counter: number;

  constructor(start: number) {
    this.start = start;
    this.counter = start;
  }

  /** Возвращает очередной идентификатор. */
  public get(): number {
    return this.counter++;
  }

  /** Сбрасывает счетчик на начальное значение. */
  public reset(): void {
    this.counter = this.start;
  }
}
