/** Модель каротажной кривой. */
export interface CaratCurveModel {
  /** Идентификатор кривой. */
  id: CaratCurveID,
  /** Тип каротажа. */
  type: CaratCurveType,
  /** Дата кривой. */
  date: Date,
  /** Начальная отметка глубины. */
  top: number,
  /** Конечная отметка глубины. */
  bottom: number,
  /** Минимальное значение кривой. */
  min: number,
  /** Максимальное значение кривой. */
  max: number,
  /** Начальная отметка оси. */
  axisMin: number,
  /** Конечная отметка оси. */
  axisMax: number,
  /** Загружать ли кривую по умолчанию. */
  defaultLoading: boolean,
  /** Данные кривой (SVG-путь). */
  path?: Path2D,
  /** Точки кривой. */
  points?: ClientPoint[],
  /** Стиль отрисовки. */
  style: CaratStyleCurve,
  /** Является ли кривая активной. */
  active: boolean,
}

export interface CurveAxisGroup {
  rect: BoundingRect,
  axes: CaratCurveModel[],
}

/* --- Carat Elements --- */

/** Словарь стилей интервальных элементов. */
export type CaratIntervalStyleDict = Record<number, CaratStyleInterval>;
/** Словарь стилей каротажных кривых. */
export type CaratCurveStyleDict = Map<CaratCurveType, CaratStyleCurve>;

export interface CaratElementInterval {
  stratumID: number,
  top: number,
  base: number,
  style: CaratStyleInterval,
}
export interface CaratStyleInterval {
  fill: ColorHEX | CanvasPattern,
  stroke: ColorHEX | CanvasPattern,
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

