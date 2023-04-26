/** Модель оси кривой. */
export interface CaratCurveAxis {
  /** Тип кривой. */
  type: CaratCurveType,
  /** Цвет оси. */
  color: ColorHEX,
  /** Минимальное значение. */
  min: number,
  /** Максимальное значение. */
  max: number,
}

/* --- Carat Elements --- */

/** Словарь стилей интервальных элементов. */
export type CaratIntervalStyleDict = Record<number, CaratStyleInterval>;
/** Словарь стилей каротажных кривых. */
export type CaratCurveStyleDict = Record<CaratCurveType, CaratStyleCurve>;

export interface CaratElementInterval {
  top: number,
  base: number,
  style: CaratStyleInterval,
}
interface CaratStyleInterval {
  borderColor: ColorHEX,
  backgroundColor: ColorHEX,
  fillStyle: string,
  lineStyle: string,
}

export interface CaratElementCurve {
  top: number,
  bottom: number,
  path: Path2D;
  style: CaratStyleCurve,
}
export interface CaratStyleCurve {
  color: ColorHEX,
  thickness: number,
}

export interface CaratElementText {
  text: string,
  style: CaratStyleText,
}
export interface CaratStyleText {
  color: ColorHEX,
  backgroundColor: ColorHEX,
  angle: number,
}

export interface CaratElementBar {
  top: number,
  base: number,
  value: number, // from 0 to 1
}

