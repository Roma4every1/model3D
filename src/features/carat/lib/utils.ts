import { CaratCurveModel } from './types';


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
  const nearestPointIndex = findNearestYPoint(curve.points, py, 0.2);
  if (nearestPointIndex === -1) return false;
  const delta = Math.abs(px - curve.points[nearestPointIndex].x);
  return delta / (curve.max - curve.min) < 0.1;
}

/** Бинарным поиском находит индекс точки, ближайшей по Y. */
function findNearestYPoint(arr: ClientPoint[], value: number, precision: number) {
  let start = 0;
  let end = arr.length - 1;

  while (start <= end) {
    let middleIndex = Math.floor((start + end) / 2);
    const y = arr[middleIndex].y;

    if (Math.abs(y - value) <= precision) {
      return middleIndex;
    }

    if (value < y) {
      end = middleIndex - 1;
    } else {
      start = middleIndex + 1;
    }
  }
  return -1;
}
