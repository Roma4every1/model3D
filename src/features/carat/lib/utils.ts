import type { CaratCurveModel } from './types';
import { distance, distanceFromStraight } from 'shared/lib';
import { constraints } from './constants';


/** Ограничивает масштаб каротажа заданным минимальным и максимальным значением. */
export function validateCaratScale(newScale: number, checkMax: boolean): number {
  const { min, max } = constraints.scale;
  if (newScale < min) newScale = min;
  if (checkMax && newScale > max) newScale = max;
  return Math.round(newScale);
}

/* --- Geometry --- */

/** Расстояние до кривой в пикселях. */
export function distanceFromCaratCurve(
  p: Point, curve: CaratCurveModel,
  rect: Rectangle, viewport: CaratViewport,
): number {
  const scaleY = viewport.scale * window.devicePixelRatio;
  const scaleX = rect.width / (curve.axisMax - curve.axisMin);

  const points = curve.points ?? [];
  const nearestPointIndex = findNearestYPoint(points, p.y / scaleY + viewport.y);

  const toRectCoordinates = (p: Point): Point => {
    if (!p) return {x: Infinity, y: Infinity};
    return {x: (p.x - curve.axisMin) * scaleX, y: (p.y - viewport.y) * scaleY};
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
function findNearestYPoint(arr: Point[], value: number): number {
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

export function formatDistance(number: number | null):  string {
  if (number === null)  return '';
  let unit = number >= 1000 ? 'км' : 'м';
  let formattedNumber;

  if (unit === 'км') {
    if(number >= 100000) {
      formattedNumber = Math.round(number / 1000).toString();
    } else {
      formattedNumber = (number / 1000).toFixed(1).replace('.', ',');
      if (formattedNumber.replace(',', '.') == 100) {
        formattedNumber = Math.round(number / 1000).toString();
      }
    }

  } else if (number < 500) {
    if (number % 1 !== 0) {
      formattedNumber = number.toFixed(1).replace('.', ',');
      if (formattedNumber.replace(',', '.') == 500) {
        formattedNumber = Math.round(number).toString();
      }
    } else {
      formattedNumber = Math.round(number).toString();
    }
  } else {
    formattedNumber = Math.round(number).toString();
    if(formattedNumber == 1000) {
      unit = 'км'
      formattedNumber = (number / 1000).toFixed(1).replace('.', ',');
    }
  }
  return `${formattedNumber}${unit}`;
}

export function getBrowserSize() {
  const userAgent = navigator.userAgent;

  let maxArea = 16_384 ** 2; // Для Chrome и Edge
  let maxWidth = 65_535;
  let maxHeight = 65_535;

  if (userAgent.includes('Firefox')) {
    maxArea = 23_168 ** 2;
    maxWidth = 32_767;
    maxHeight = 32_767;
  }
  return {maxArea, maxWidth, maxHeight};
}
