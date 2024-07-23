/* --- Numeric --- */

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

/* --- Set Theory --- */

/** Добавляет во множество элементы. */
export function addToSet<T>(set: Set<T>, elements: Iterable<T>): void {
  for (const element of elements) set.add(element);
}

/**
 * Возвращает объединение двух множеств.
 * @example
 * const a = new Set([1, 2]);
 * const b = new Set([2, 3]);
 * const c = setUnion(a, b); // Set {1, 2, 3}
 */
export function setUnion<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...a, ...b]);
}

/**
 * Пересекаются ли два множества.
 * @example
 * const a = new Set([1, 2, 3]);
 * const b = new Set([3, 4, 5]);
 * hasIntersection(a, b); // true
 */
export function hasIntersection<T>(a: Set<T>, b: Iterable<T>): boolean {
  if (a.size === 0) return false;
  for (const element of b) {
    if (a.has(element)) return true;
  }
  return false;
}

/**
 * Возвращает пересечение двух множеств.
 * @example
 * const a = new Set([1, 2, 3]);
 * const b = new Set([2, 3, 4]);
 * setIntersection(a, b); // Set { 2, 3 }
 */
export function setIntersection<T>(a: Set<T>, b: Iterable<T>): Set<T> {
  const intersection = new Set<T>();
  for (const element of b) {
    if (a.has(element)) intersection.add(element);
  }
  return intersection;
}

/**
 * Декартово произведение.
 * @example
 * cartesianProduct([1, 2], [3, 4]) => [[1, 3], [1, 4], [2, 3], [2, 4]]
 */
export function cartesianProduct(...values: any[][]): any[][] {
  return values.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));
}

/* --- Geometry --- */

/** Находит расстояние между двумя точками. */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Расстояние от точки до прямой по двум точкам. */
export function distanceFromStraight(p: Point, p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const numerator = Math.abs(dy * p.x - dx * p.y + p2.x * p1.y - p2.y * p1.x);
  const denominator = Math.sqrt(dx * dx + dy * dy);
  return numerator / denominator;
}

/** Находится ли точка внутри прямоугольника. */
export function isRectInnerPoint(p: Point, rect: Rectangle): boolean {
  const xIntersection = p.x >= rect.left && p.x <= rect.left + rect.width;
  return xIntersection && (p.y >= rect.top && p.y <= rect.top + rect.height);
}
