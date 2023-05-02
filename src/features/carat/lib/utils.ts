import { CaratCurveModel } from './types';
import { distance } from 'shared/lib';


/** Плавно переместит порт просмотра.
 * @param viewport порт просмотра
 * @param stage экземпляр сцены
 * @param by на сколько переместить
 * */
export function moveSmoothly(viewport: CaratViewport, stage: ICaratStage, by: number) {
  const duration = 250; // 0.25 second
  const frameTime = 16; // 60 FPS => 1000ms / 60

  let time = 0;
  let startY = viewport.y;
  let lastY = viewport.y;

  const id = setInterval(() => {
    let newY = startY + by * cubicBezierEaseInOut(time / duration);
    let y = viewport.y + newY - lastY;

    if (y > viewport.max) y = viewport.max;
    else if (y < viewport.min) y = viewport.min;

    if (viewport.y !== y) {
      viewport.y = y;
      stage.render();
    }
    lastY = newY;
    if (time >= duration) clearInterval(id);
    time += frameTime;
  }, frameTime);
}

/** Аналог CSS timing function `ease-in-out`. */
function cubicBezierEaseInOut(t) {
  return t * t * (3 - 2 * t);
}

/* --- Geometry --- */

/** Находится ли точка внутри ограничивающего прямоугольника. */
export function isRectInnerPoint(x: number, y: number, rect: BoundingRect) {
  return (x >= rect.left && x <= rect.left + rect.width) && (y >= rect.top && y <= rect.top + rect.height);
}

/** Находится ли точка рядом с кривой. */
export function isPointNearCurve(px: number, py: number, curve: CaratCurveModel): boolean {
  const nearestPointIndex = findNearestYPoint(curve.points, py);
  const p1 = curve.points[nearestPointIndex - 1];
  const p2 = curve.points[nearestPointIndex];
  const p3 = curve.points[nearestPointIndex + 1];

  const resultDistance = Math.min(
    distance(px, py, p1.x, p1.y),
    distance(px, py, p2.x, p2.y),
    distance(px, py, p3.x, p3.y),
    distanceFromStraight(px, py, p1, p2),
    distanceFromStraight(px, py, p2, p3),
  );

  const maxNearDistance = 0.05 * (curve.max - curve.min);
  return resultDistance < maxNearDistance;
}

/** Расстояние от точки до прямой. */
function distanceFromStraight(x: number, y: number, p1: ClientPoint, p2: ClientPoint) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const numerator = Math.abs(dy * x - dx * y + p2.x * p1.y - p2.y * p1.x);
  const denominator = Math.sqrt(dx * dx + dy * dy);
  return numerator / denominator;
}

/** Бинарным поиском находит индекс точки, ближайшей по Y. */
function findNearestYPoint(arr: ClientPoint[], value: number) {
  let start = 0;
  let end = arr.length - 1;

  while (start <= end) {
    let middleIndex = Math.floor((start + end) / 2);
    const y = arr[middleIndex].y;

    if (value < y) {
      end = middleIndex - 1;
    } else {
      start = middleIndex + 1;
    }
  }
  return start;
}
