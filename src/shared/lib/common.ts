/** Сравнивает два массива на равенство.
 *
 * **Не делает глубокое сравнение.**
 * @example
 * const obj = {};
 * compareArrays([1, 2], [1, 2]) => true
 * compareArrays([obj], [obj])   => true
 * compareArrays([obj], [{}])    => false
 * */
export function compareArrays(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/** Сравнивает два объекта на равенство.
 *
 * **Не делает глубокое сравнение.**
 * @example
 * compareObjects({x: 1}, {x: 1})   => true
 * compareObjects({x: []}, {x: []}) => false
 * */
export function compareObjects(a: Record<any, any>, b: Record<any, any>): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

/* --- Sets --- */

/** Возвращает объединение двух множеств.
 * @example
 * const a = new Set([1, 2]);
 * const b = new Set([2, 3]);
 * const c = setUnion(a, b); // Set {1, 2, 3}
 * */
export function setUnion<Type>(a: Set<Type>, b: Set<Type>): Set<Type> {
  return new Set([...a, ...b]);
}

/** Возвращает множество элементов, которые входят в `a`, но НЕ входят в `b`. */
export function leftAntiJoin<Type>(a: Set<Type>, b: Iterable<Type>): Set<Type> {
  const result = new Set(a);
  for (const item of b) {
    if (result.has(item)) result.delete(item);
  }
  return result;
}

/* --- Math --- */

/** Округляет число до заданного количества знаков после запятой.
 * @param n число, которое нужно округлить
 * @param digits количество знаков после запятой
 * @example
 * round(0.234, 2) => 0.23
 * round(234, -2) => 200
 * */
export function round(n: number, digits: number = 0): number {
  const multiplier = Math.pow(10, digits);
  return Math.round(n * multiplier) / multiplier;
}

/** Округляет в низ до ближайшего числа, удобного для восприятия на оси графика.
 * @example
 * getPragmaticMin(4)    => 0
 * getPragmaticMin(33.3) => 25
 * getPragmaticMin(543)  => 500
 * */
export function getPragmaticMin(n: number): number {
  n = Math.floor(n);
  if (n < 10) return 0;
  const e = Math.pow(10, n.toString().length - 1);
  n = n / e;

  if (n >= 5) return 5 * e;
  if (n >= 2.5) return 2.5 * e;
  return (n >= 2 ? 2 : 1) * e;
}

/** Округляет в вверх до ближайшего числа, удобного для восприятия на оси графика.
 * @example
 * getPragmaticMax(4)    => 5
 * getPragmaticMax(33.3) => 50
 * getPragmaticMax(543)  => 1000
 * */
export function getPragmaticMax(n: number): number {
  n = Math.ceil(n);
  const e = Math.pow(10, n.toString().length - 1);
  n = n / e;

  if (n <= 1) return e;
  if (e < 2 && n <= 2) return 2 * e;
  if (n <= 2.5) return 2.5 * e;
  return (n <= 5 ? 5 : 10) * e;
}
