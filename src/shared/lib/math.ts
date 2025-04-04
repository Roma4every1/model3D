/* --- Numeric --- */

/**
 * Округляет число до заданного количества знаков после запятой.
 * @param n число, которое нужно округлить
 * @param digits количество знаков после запятой
 * @example
 * round(0.234, 2) => 0.23
 * round(234, -2) => 200
 */
export function round(n: number, digits: number = 0): number {
  const multiplier = Math.pow(10, digits);
  return Math.round(n * multiplier) / multiplier;
}

/** Возвращает рандомное целое число не меньше `min` и не больше `max`. */
export function randomInt(min: number = 0, max: number = 1): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Округляет вниз до ближайшего числа, удобного для восприятия на оси. */
export function calcAxisMin(dataMin: number): number {
  if (!dataMin || dataMin > 0) return 0;
  return -calcAxisMax(-dataMin);
}

/** Округляет вверх до ближайшего числа, удобного для восприятия на оси. */
export function calcAxisMax(dataMax: number): number {
  if (!dataMax || dataMax < 0) {
    return 0;
  }
  if (dataMax >= 0.1) {
    const thresholds = [1, 2, 5, 10, 15, 20, 25, 50, 100, 150, 200, 250, 500, 1000, 1500, 2000, 2500];
    const threshold = thresholds.find(t => t > dataMax);
    if (threshold !== undefined) return threshold;
  }
  const base = Math.pow(10, Math.floor(Math.log10(dataMax)));
  let max = base;

  if (dataMax <= max) return max;
  max = base * 2;
  if (dataMax <= max) return max;
  max = base * 5;
  if (dataMax <= max) return max;
  return base * 10;
}

export function calcCentroid(points: Point[]): Point {
  let xSum = 0;
  let ySum = 0;

  for (const point of points) {
    xSum += point.x;
    ySum += point.y;
  }
  return {x: xSum / points.length, y: ySum / points.length};
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

/** Расстояние между двумя точками. */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Квадрат расстояния между двумя точками. */
export function squaredDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
}

/** Квадрат расстояния между точкой и отрезком. */
export function squaredSegmentDistance(
  x: number, y: number,
  x1: number, y1: number, x2: number, y2: number
): number {
  const d = squaredDistance(x1, y1, x2, y2);
  if (d < 1e-6) return squaredDistance(x1, y1, x, y);

  let t = ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / d;
  if (t < 0) {
    t = 0;
  } else if (t > 1) {
    t = 1;
  }
  return squaredDistance(x, y, x1 + t * (x2 - x1), y1 + t * (y2 - y1));
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

/** Находится ли точка внутри многоугольника. */
export function isPolygonInnerPoint({x, y}: Point, polygon: Point[]): boolean {
  if (polygon.length < 3) return false;
  let intersections = 0;
  let i = 0, iMax = polygon.length - 1;
  let x1: number, x2: number, y1: number, y2: number;

  while (i < iMax) {
    ({ x: x1, y: y1 } = polygon[i]);
    ({ x: x2, y: y2 } = polygon[++i]);
    // пересекает ли горизонтальный луч ребро многоугольника
    if (y1 > y !== y2 > y && x < ((x2 - x1) * (y - y1)) / (y2 - y1) + x1) ++intersections;
  }
  ({ x: x1, y: y1 } = polygon[i]);
  ({ x: x2, y: y2 } = polygon[0]);
  if (y1 > y !== y2 > y && x < ((x2 - x1) * (y - y1)) / (y2 - y1) + x1) ++intersections;

  return intersections % 2 === 1;
}
