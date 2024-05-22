type I18nOptions = Record<string, string | number>;

/** Тип какого-либо значения. */
type DataTypeName = 'boolean' | 'i8' | 'i16' | 'i32' | 'i64' | 'u8' | 'u16' | 'u32' | 'u64' |
  'f32' | 'f64' | 'string' | 'date' | 'datetime' | 'blob' | 'null';

type StringMatcher = string | string[] | RegExp;

/** Колбэк, принимающий один аргумент. */
type EventCallback<T> = (arg: T) => void;

/** Двумерный массив чисел. */
type Matrix = number[][];

/** Параметры CSS-шрифта.
 * @example
 * { size: 12, style: "normal", family: "monospace" }
 */
interface CSSFont {
  /** Размер шрифта в пикселях. */
  size: number;
  /** Стиль: обычный, жирный, курсив и т.п. */
  style: string;
  /** Семейство шрифтов. */
  family: string;
}
