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

/** Элемент каротажной диаграммы. */
export type CaratElement = CaratElementInterval | CaratElementCurve |
  CaratElementBar | CaratElementText;

/** Стиль элемента каротажной диаграммы. */
export type CaratElementStyle = CaratStyleInterval | CaratStyleCurve |
  CaratStyleBar | CaratStyleText;

/** Словарь стилей интервальных элементов. */
export type CaratIntervalStyleDict = Record<number, CaratStyleInterval>;
/** Словарь стилей каротажных кривых. */
export type CaratCurveStyleDict = Record<CaratCurveType, CaratStyleCurve>;

export enum CaratElementType {
  /** Интервал (пласт). */
  Interval = 1,
  /** Каротажная кривая. */
  Curve = 2,
  /** Текст. */
  Text = 3,
  /** Гистограмма. */
  Bar = 4,
}

export interface CaratElementInterval {
  type: CaratElementType.Interval,
  top: number,
  base: number,
  style: CaratStyleInterval,
}
interface CaratStyleInterval {
  color: ColorHEX,
  borderColor: ColorHEX,
  backgroundColor: ColorHEX,
  fillStyle: string,
  lineStyle: string,
}

interface CaratElementCurve {
  type: CaratElementType.Curve;
  path: Path2D;
  style: CaratStyleCurve,
}
export interface CaratStyleCurve {
  color: ColorHEX,
  thickness: number,
}

interface CaratElementText {
  type: CaratElementType.Text,
  text: string,
  style: CaratStyleText,
}
export interface CaratStyleText {
  color: ColorHEX,
  backgroundColor: ColorHEX,
  angle: number,
}

interface CaratElementBar {
  type: CaratElementType.Bar,
  top: number,
  base: number,
  percentStart: number,
  percentEnd: number,
  style: CaratStyleBar,
}
export interface CaratStyleBar {
  align: 'left' | 'right' | 'center',
  externalBorderColor: ColorHEX,
}
