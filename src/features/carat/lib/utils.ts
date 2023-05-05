import { CaratCurveModel } from './types';
import { distance, distanceFromStraight } from 'shared/lib';


/** Определяет ширину трека по ширинам колонок. */
export function calculateTrackWidth(columns: CaratColumnInit[]) {
  let trackWidth = 0;
  for (const column of columns) {
    const { type, width } = column.settings;
    if (type === 'normal') trackWidth += width;
  }
  return trackWidth;
}

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
      stage.lazyRender();
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

/** Находится ли точка рядом с кривой. */
export function isPointNearCurve(p: Point, curve: CaratCurveModel): boolean {
  const nearestPointIndex = findNearestYPoint(curve.points, p.y);
  const p1 = curve.points[nearestPointIndex - 1] ?? {x: Infinity, y: Infinity};
  const p2 = curve.points[nearestPointIndex];
  const p3 = curve.points[nearestPointIndex + 1] ?? {x: Infinity, y: Infinity};

  const resultDistance = Math.min(
    distance(p, p1), distance(p, p2), distance(p, p3),
    distanceFromStraight(p, p1, p2), distanceFromStraight(p, p2, p3),
  );

  const maxNearDistance = 0.05 * (curve.max - curve.min);
  return resultDistance < maxNearDistance;
}

/** Бинарным поиском находит индекс точки, ближайшей по Y. */
function findNearestYPoint(arr: Point[], value: number) {
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
