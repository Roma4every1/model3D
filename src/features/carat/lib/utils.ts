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

/** `#ARGB => #RGBA` */
export function fixHEX(hex: string) {
  if (hex?.length > 7) hex = '#' + hex.substring(3) + hex.substring(1, 3);
  return hex;
}

/* --- Smooth Scroll ---*/

/** Плавно переместит вьюпорт трека.
 * @param stage сцена диаграммы
 * @param index индекс изменяемеого трека, если -1, то все
 * @param direction в какую сторону
 * */
export function moveSmoothly(stage: ICaratStage, index: number, direction: 1 | -1) {
  const duration = 250; // 0.25 second
  const frameTime = 16; // 60 FPS => 1000ms / 60

  if (index === -1) return;
  const track = stage.trackList[index];
  const scroll = track.viewport.scroll;

  if (scroll.direction !== direction) {
    scroll.direction = direction;
    scroll.queue = [];
  }

  const by = direction * scroll.step;
  const queue = scroll.queue;
  let time = 0, prevY = 0, step = 0;

  while (time < duration) {
    const currentY = by * cubicBezierEaseInOut(time / duration);
    const delta = currentY - prevY;

    if (queue[step] === undefined) {
      queue.push(delta);
    } else {
      queue[step] += delta;
    }

    step += 1;
    prevY = currentY;
    time += frameTime;
  }

  if (scroll.id === null) {
    scroll.id = window.setInterval(moveView, frameTime, stage, track.viewport, index);
  }
}

function moveView(stage: ICaratStage, viewport: CaratViewport, i: number) {
  const scroll = viewport.scroll;

  if (scroll.queue.length === 0) {
    clearInterval(scroll.id);
    return scroll.id = null;
  }

  let y = viewport.y + scroll.queue.shift();
  if (y + viewport.height > viewport.max) y = viewport.max - viewport.height;
  else if (y < viewport.min) y = viewport.min;

  if (viewport.y !== y) {
    viewport.y = y;
    stage.lazyRender(i);
  }
}

/** Аналог CSS timing function `ease-in-out`. */
function cubicBezierEaseInOut(t) {
  return t * t * (3 - 2 * t);
}

/* --- Geometry --- */

/** Расстояние до кривой в пикселях. */
export function distanceFromCaratCurve(
  p: Point, curve: CaratCurveModel,
  rect: Rectangle, viewport: CaratViewport,
): number {
  const scaleY = viewport.scale * window.devicePixelRatio;
  const scaleX = rect.width / curve.axisMax;

  const points = curve.points ?? [];
  const nearestPointIndex = findNearestYPoint(points, p.y / scaleY + viewport.y);

  const toRectCoordinates = (p: Point): Point => {
    if (!p) return {x: Infinity, y: Infinity};
    return {x: p.x * scaleX, y: (p.y - viewport.y) * scaleY};
  };

  const p1 = toRectCoordinates(points[nearestPointIndex - 1]);
  const p2 = toRectCoordinates(points[nearestPointIndex]);
  const p3 = toRectCoordinates(points[nearestPointIndex + 1]);

  return Math.min(
    distance(p, p1), distance(p, p2), distance(p, p3),
    distanceFromStraight(p, p1, p2), distanceFromStraight(p, p2, p3),
  );
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
