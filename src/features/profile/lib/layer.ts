/** Класс, содержащий данные слое пласта профиля. */
export class ProfileLayer implements IProfileLayer {
  /** Координаты верхней и нижней ограничивающей линии слоя. */
  public borderLine: ProfileBorderLineData;

  /** Значение Y в системе координат, где подошва пласта - 0, кровля - 1. */
  public topBaseY: number;

  constructor(borderLine: ProfileBorderLineData, topBaseY: number) {
    this.borderLine = borderLine;
    this.topBaseY = topBaseY;
  }
}
