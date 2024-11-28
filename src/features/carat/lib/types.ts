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
  style: LineStyle;
  /** Является ли кривая активной. */
  active: boolean;
  /** Была ли кривая трансформирована для показа в режиме конструкции. */
  transformed?: boolean;
}

export interface CurveGroupState {
  rect: Rectangle;
  elements: CaratCurveModel[];
}

export interface CaratIntervalModel {
  stratumID?: number;
  top: number;
  bottom: number;
  style: ShapeStyle,
  text?: string;
}
export interface CaratBarModel {
  top: number;
  bottom: number;
  value: number; // from 0 to 1
  text?: string;
}

/* --- Correlations --- */

/** Корреляции пластов между двумя треками.
 * + `rect`: {@link Rectangle}
 * + `leftViewport`: {@link CaratViewport}
 * + `rightViewport`: {@link CaratViewport}
 * + `data`: {@link StratumCorrelation}[]
 */
export interface CaratCorrelation {
  /** Ограничивающий прямоугольник. */
  rect: Rectangle;
  /** Ссылка на вьюпорт трека слева. */
  leftViewport: CaratViewport;
  /** Ссылка на вьюпорт трека справа. */
  rightViewport: CaratViewport;
  /** Корреляции пластов. */
  data: StratumCorrelation[];
  /** Расстояние между двумя треками */
  label: string;
}

/** Корреляция пласта между двумя треками.
 * + `leftTop: number`
 * + `leftBottom: number`
 * + `rightTop: number`
 * + `rightBottom: number`
 * + `style`: {@link ShapeStyle}
 */
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
  style: ShapeStyle;
}
