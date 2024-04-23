/** Идентификатор сессии. */
type SessionID = string;

type I18nOptions = Record<string, string | number>;

/** Тип какого-либо значения. */
type DataTypeName = 'boolean' | 'i8' | 'i16' | 'i32' | 'i64' | 'u8' | 'u16' | 'u32' | 'u64' |
  'f32' | 'f64' | 'string' | 'date' | 'datetime' | 'blob' | 'null';

/** HEX цвета.
 * @example
 * "#123456"
 * */
type ColorHEX = string;

/** Модель цвета в RGBA.
 * @example
 * [0, 0, 0, 1] // black
 * [255, 255, 255, 1] // white
 * */
type ColorModelRGBA = [number, number, number, number];

/** Параметры CSS-шрифта.
 * @example
 * { size: 12, style: "normal", family: "monospace" }
 * */
interface CSSFont {
  /** Размер шрифта в пикселях. */
  size: number;
  /** Стиль: обычный, жирный, курсив и т.п. */
  style: string;
  /** Семейство шрифтов. */
  family: string;
}

type PayloadAction<Type extends string = string, Payload = never> = Payload extends never
  ? {type: Type}
  : {type: Type, payload: Payload};

/** Двумерный массив чисел. */
type Matrix = number[][];

/* --- Geometry --- */

/** Точка на плоскости: `x` и `y`. */
interface Point {
  /** Координата по X. */
  x: number;
  /** Координата по Y. */
  y: number;
}

/** Прямоугольник по опорной точке и размерам:
 * `top`, `left`, `width`, `height`.
 * */
interface Rectangle {
  /** Верхняя координата. */
  top: number;
  /** Левая координата. */
  left: number;
  /** Ширина координата. */
  width: number;
  /** Высота координата. */
  height: number;
}
