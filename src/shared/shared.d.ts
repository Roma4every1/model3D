/** Число для сортировки каких-либо элементов. */
type Order = number;

/** Строка для отображения названия сущности на интерфейсе. */
type DisplayName = string;

/** Словарь изображений. */
type ImageDict<Items = string> = Record<Items, ImagePath>;

/** Путь к изображению. */
type ImagePath = string;

/** HEX цвета.
 * @example
 * "#123456"
 * */
type ColorHEX = string;

/** Параметры CSS-шрифта.
 * @example
 * { size: 12, style: "normal", family: "monospace" }
 * */
interface CSSFont {
  /** Размер шрифта в пикселях. */
  size: number,
  /** Стиль: обычный, жирный, курсив и т.п. */
  style: string,
  /** Семейство шрифтов. */
  family: string,
}

/* --- Geometry --- */

/** Точка на плоскости: `x` и `y`. */
interface Point {
  /** Координата по X. */
  x: number,
  /** Координата по Y. */
  y: number
}

/** Прямоугольник по опорной точке и размерам:
 * `top`, `left`, `width`, `height`.
 * */
interface Rectangle {
  /** Верхняя координата. */
  top: number,
  /** Левая координата. */
  left: number,
  /** Ширина координата. */
  width: number,
  /** Высота координата. */
  height: number,
}
