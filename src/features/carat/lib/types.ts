/** Словарь стилей интервальных элементов. */
export type CaratIntervalStyleDict = Record<number, CaratIntervalStyle>;
/** Словарь стилей каротажных кривых. */
export type CaratCurveStyleDict = Map<CaratCurveType, CaratCurveStyle>;

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
  path: Path2D,
  /** Точки кривой. */
  points: Point[],
  /** Стиль отрисовки. */
  style: CaratCurveStyle,
  /** Является ли кривая активной. */
  active: boolean,
}
export interface CaratCurveStyle {
  color: ColorHEX,
  thickness: number,
}

export interface CurveGroupState {
  rect: Rectangle,
  elements: CaratCurveModel[],
}
export interface CurveAxisGroup {
  rect: Rectangle,
  axes: CaratCurveModel[],
}

export interface CaratIntervalModel {
  stratumID?: number,
  top: number,
  bottom: number,
  style: CaratIntervalStyle,
  text?: string,
}
export interface CaratBarModel {
  top: number,
  bottom: number,
  value: number, // from 0 to 1
  text?: string,
}
export interface CaratIntervalStyle {
  fill: ColorHEX | CanvasPattern,
  stroke: ColorHEX,
}
