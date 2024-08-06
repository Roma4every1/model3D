/**
 * Строка, обозначающая какой-либо цвет.
 * @example
 * '#112233'
 * 'rgb(255, 255, 255)'
 */
type ColorString = string;

/**
 * Модель цвета в RGBA.
 * @example
 * [0, 0, 0, 1] // black
 * [255, 255, 255, 1] // white
 * */
type RGBA = [number, number, number, number];

/**
 * Представление выравнивания в виде числа.
 * + вертикаль: `left`, `center`, `right`
 * + горизонталь: `bottom`, `center`, `top`
 */
type NAlign = -1 | 0 | 1;

/* --- Geometry Objects --- */

/** Точка на плоскости: `x` и `y`. */
interface Point {
  /** Координата по X. */
  x: number;
  /** Координата по Y. */
  y: number;
}

/** Прямоугольник по опорной точке и размерам: `top`, `left`, `width`, `height`. */
interface Rectangle {
  /** Верхняя координата. */
  top: number;
  /** Левая координата. */
  left: number;
  /** Ширина прямоугольника. */
  width: number;
  /** Высота прямоугольника. */
  height: number;
}

/* --- Style --- */

/** Стиль 2D-фигуры: заливка и обводка. */
interface ShapeStyle {
  /** Стиль заливки. */
  fill: ColorString | CanvasPattern;
  /** Цвет обводки. */
  stroke: ColorString;
}

/** Стиль линии: цвет и толщина. */
interface LineStyle {
  /** Цвет линии. */
  color: ColorString;
  /** Толщина линии. */
  thickness: number;
}
