/** Расстояние между двумя точками. */
export function pointDistance(p1: Point, p2: Point): number {
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
