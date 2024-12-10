import { chunk } from 'lodash';


export function createMapElementInit(element: MapElement): MapElement {
  const type = element.type;
  let copy: MapElement;

  if (type === 'sign' || type === 'label') {
    copy = {...element};
  } else if (type === 'field') {
    copy = structuredClone(element);
  } else {
    copy = structuredClone({...element, fillStyle: undefined});
    copy.fillStyle = element.fillStyle;
  }
  delete copy.selected;
  delete copy.edited;
  return copy;
}

/** Количество пикселей в метре. В браузере `1cm = 96px / 2.54`. */
export const PIXEL_PER_METER: number = 100 * 96 / 2.54;

export function getBoundsByPoints(path: number[]): Bounds {
  const points = chunk(path, 2);
  const xValues = points.map(p => p[0]);
  const yValues = points.map(p => p[1]);

  return {
    min: {x: Math.min(...xValues), y: Math.min(...yValues)},
    max: {x: Math.max(...xValues), y: Math.max(...yValues)}
  };
}

export function getNearestPointIndex(point: Point, scale: MapScale, polyline: MapPolyline): number {
  let minRadius: number, nearestIndex: number | null = null;
  const points = chunk<number>(polyline.arcs[0].path, 2);

  points.forEach((p, i) => {
    const localDist = Math.sqrt(Math.pow(p[0] - point.x, 2) + Math.pow(p[1] - point.y, 2));
    if (!minRadius || localDist < minRadius) {
      minRadius = localDist;
      if ((minRadius / scale) < 0.015) nearestIndex = i;
    }
  });
  return nearestIndex;
}

export function getNearestSegment(point: Point, polyline: MapPolyline): number {
  let nearestNp = 0;
  let points = chunk(polyline.arcs[0].path, 2) as [number, number][];
  if (polyline.arcs[0].closed) {
    points = [...points, points[0]];
  }
  let minDist = squaredDistanceBetweenPointAndSegment(points[0], points[1], point);

  for (let i = 1; i < points.length - 1; i++) {
    let dist = squaredDistanceBetweenPointAndSegment(points[i], points[i + 1], point);

    if (dist < minDist) {
      minDist = dist;
      nearestNp = i;
    }
  }

  if (!polyline.arcs[0].closed) {
    const d1 = Math.pow(points[0][0] - point.x, 2) + Math.pow(points[0][1] - point.y, 2);
    const d2 = Math.pow(points[points.length - 1][0] - point.x, 2) + Math.pow(points[points.length - 1][1] - point.y, 2);

    if (d1 <= minDist) nearestNp = -1;
    if (d2 <= minDist && d2 < d1) nearestNp = points.length - 1;
  }
  return nearestNp;
}

function squaredDistanceBetweenPointAndSegment([x1, y1]: [number, number], [x2, y2]: [number, number], point: Point): number {
  if (x1 === x2 && y1 === y2) return Infinity;

  const aSquared = Math.pow(x1 - point.x, 2) + Math.pow(y1 - point.y, 2);
  const bSquared = Math.pow(x2 - point.x, 2) + Math.pow(y2 - point.y, 2);
  const cSquared = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);

  if (aSquared > bSquared + cSquared) return bSquared;
  if (bSquared > aSquared + cSquared) return aSquared;

  const doubleSquare = Math.abs((x1 - point.x) * (y2 - point.y) - (x2 - point.x) * (y1 - point.y));
  const distance = doubleSquare * doubleSquare / cSquared;
  return isNaN(distance) ? Infinity : distance;
}

/** Определяет вьюпорт карты, чтобы все элементы влазили в экран. */
export function getFullViewport(layers: IMapLayer[], canvas: HTMLCanvasElement): MapViewport {
  let xMin = Infinity, yMin = Infinity;
  let xMax = -Infinity, yMax = -Infinity;

  for (const layer of layers) {
    if (!layer.visible || layer.temporary) continue;
    const { min, max } = layer.bounds;

    if (min.x < xMin) xMin = min.x;
    if (min.y < yMin) yMin = min.y;
    if (max.x > xMax) xMax = max.x;
    if (max.y > yMax) yMax = max.y;
  }

  const scaleX = (xMax - xMin) * PIXEL_PER_METER / canvas.clientWidth;
  const scaleY = (yMax - yMin) * PIXEL_PER_METER / canvas.clientHeight;
  const scale: MapScale = 1.15 *Math.max(scaleX, scaleY);

  return {cx: (xMin + xMax) / 2, cy: (yMin + yMax) / 2, scale};
}
