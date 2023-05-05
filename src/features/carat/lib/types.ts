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
  path?: Path2D,
  /** Точки кривой. */
  points?: Point[],
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
  label?: CaratIntervalLabel,
}
export interface CaratIntervalStyle {
  fill: ColorHEX | CanvasPattern,
  stroke: ColorHEX,
}
export interface CaratIntervalLabel {
  text: string,
  color: ColorHEX,
  backgroundColor: ColorHEX,
  angle: number,
}

export interface CaratElementBar {
  top: number,
  bottom: number,
  value: number, // from 0 to 1
}
