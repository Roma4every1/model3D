/** Словарь стилей интервальных элементов. */
export type CaratIntervalStyleDict = Record<number, CaratIntervalStyle>;
/** Словарь стилей каротажных кривых. */
export type CaratCurveStyleDict = Map<CaratCurveType, CaratCurveStyle>;

/** Модель каротажной кривой. */
export interface CaratCurveModel {
  /** Идентификатор кривой. */
  id: CaratCurveID;
  /** Тип каротажа. */
  type: CaratCurveType;
  /** Дата кривой. */
  date: Date;
  /** Описание (метод исследования). */
  description: string;
  /** Начальная отметка глубины. */
  top: number;
  /** Конечная отметка глубины. */
  bottom: number;
  /** Минимальное значение кривой. */
  min: number;
  /** Максимальное значение кривой. */
  max: number;
  /** Начальная отметка оси. */
  axisMin: number;
  /** Конечная отметка оси. */
  axisMax: number;
  /** Загружать ли кривую по умолчанию. */
  defaultLoading: boolean;
  /** Данные кривой (SVG-путь). */
  path: Path2D;
  /** Точки кривой. */
  points: Point[];
  /** Стиль отрисовки. */
  style: CaratCurveStyle;
  /** Является ли кривая активной. */
  active: boolean;
}
export interface CaratCurveStyle {
  color: ColorHEX;
  thickness: number;
}

export interface CurveGroupState {
  rect: Rectangle;
  elements: CaratCurveModel[];
}
export interface CurveAxisGroup {
  rect: Rectangle;
  axes: CaratCurveModel[];
}

export interface CaratIntervalModel {
  stratumID?: number;
  top: number;
  bottom: number;
  styleID: string;
  style: CaratIntervalStyle,
  text?: string;
}
export interface CaratBarModel {
  top: number;
  bottom: number;
  value: number; // from 0 to 1
  text?: string;
}
export interface CaratIntervalStyle {
  fill: ColorHEX | CanvasPattern;
  stroke: ColorHEX;
}

/** Элемент конструкции скважины. */
export interface ConstructionElementModel {
  top: number;
  bottom: number;
  innerDiameter: number;
  outerDiameter: number;
  cement: number;
}

/** Элемент конструкции скважины в виде картинки с насосом. */
export interface CaratPumpModel {
  top: number;
  bottom: number;
  pumpID: number;
  pumpImage: any;
}

/** Элемент конструкции скважины в виде вертикальной прямой. */
export interface CaratVerticalLineModel {
  top: number;
  bottom: number;
  width: number;
}

/* --- Correlations --- */

/** Корреляции пластов между двумя треками.
 * + `rect`: {@link Rectangle}
 * + `leftViewport`: {@link CaratViewport}
 * + `rightViewport`: {@link CaratViewport}
 * + `data`: {@link StratumCorrelation}[]
 * */
export interface CaratCorrelation {
  /** Ограничивающий прямоугольник. */
  rect: Rectangle;
  /** Ссылка на вьюпорт трека слева. */
  leftViewport: CaratViewport;
  /** Ссылка на вьюпорт трека справа. */
  rightViewport: CaratViewport;
  /** Корреляции пластов. */
  data: StratumCorrelation[];
}

/** Корреляция пласта между двумя треками.
 * + `leftTop: number`
 * + `leftBottom: number`
 * + `rightTop: number`
 * + `rightBottom: number`
 * */
export interface StratumCorrelation {
  /** Глубина кровли пласта в треке слева. */
  leftTop: number;
  /** Глубина подошвы пласта в треке слева. */
  leftBottom: number;
  /** Глубина кровли пласта в треке справа. */
  rightTop: number;
  /** Глубина подошвы пласта в треке справа. */
  rightBottom: number;
  /** Заливка и обводка корреляции. */
  style: CaratIntervalStyle;
}

/* --- Inclinometry --- */

/** Отображение "глубина => абс. отметка". */
export type InclinometryMap = Map<number, number>;

/** Опорная точка инклинометрии.
 * + `depth: number`
 * + `absMark: number`
 * */
export interface InclinometryMark {
  /** Значение глубины. */
  depth: number;
  /** Значение абсолютной отметки. */
  absMark: number;
}
