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

/** Возвращает точку с координатами клика мыши. */
export function clientPoint(event: MouseEvent): Point {
  return {x: event.offsetX, y: event.offsetY};
}

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
  let minRadius, nearestIndex: number | null = null;
  const points = chunk<number>(polyline.arcs[0].path, 2);

  points.forEach((p, i) => {
    //distance()
    const localDist = Math.sqrt(Math.pow(p[0] - point.x, 2) + Math.pow(p[1] - point.y, 2));
    if (!minRadius || localDist < minRadius) {
      minRadius = localDist;
      if ((minRadius / scale) < 0.015) nearestIndex = i;
    }
  });
  return nearestIndex;
}

export function getNearestSegment(point, polyline: MapPolyline) {
  let nearestNp = 0;
  let points = chunk<number>(polyline.arcs[0].path, 2);
  if (polyline.arcs[0].closed) {
    points = [...points, points[0]];
  }
  let minDist = squaredDistanceBetweenPointAndSegment([points[0], points[1]], point);

  for (let i = 1; i < points.length - 1; i++) {
    let segment = [points[i], points[i + 1]];
    let dist = squaredDistanceBetweenPointAndSegment(segment, point);

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

export function squaredDistanceBetweenPointAndSegment(segment, point) {
  if (segment[0][0] === segment[1][0] && segment[0][1] === segment[1][1]) return Infinity;

  const aSquared = Math.pow(segment[0][0] - point.x, 2) + Math.pow(segment[0][1] - point.y, 2);
  const bSquared = Math.pow(segment[1][0] - point.x, 2) + Math.pow(segment[1][1] - point.y, 2);
  const cSquared = Math.pow(segment[1][0] - segment[0][0], 2) + Math.pow(segment[1][1] - segment[0][1], 2);

  if (aSquared > bSquared + cSquared) return bSquared;
  if (bSquared > aSquared + cSquared) return aSquared;

  const doubleSquare = Math.abs((segment[0][0] - point.x) * (segment[1][1] - point.y) - (segment[1][0] - point.x) * (segment[0][1] - point.y));
  const distance = doubleSquare * doubleSquare / cSquared;
  return isNaN(distance) ? Infinity : distance;
}

/** Определяет вьюпорт карты, чтобы все элементы влазили в экран. */
export function getFullViewport(layers: IMapLayer[], canvas: HTMLCanvasElement): MapViewport {
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  for (const layer of layers) {
    if (!layer.visible || layer.isTemporary()) continue;
    const { min, max } = layer.bounds;

    if (min.x < minX) minX = min.x;
    if (min.y < minY) minY = min.y;
    if (max.x > maxX) maxX = max.x;
    if (max.y > maxY) maxY = max.y;
  }

  const scaleX = 1.2 * (maxX - minX) * PIXEL_PER_METER / canvas.clientWidth;
  const scaleY = 1.2 * (maxY - minY) * PIXEL_PER_METER / canvas.clientHeight;
  const scale: MapScale = Math.max(scaleX, scaleY);

  return {centerX: (minX + maxX) / 2, centerY: (minY + maxY) / 2, scale};
}
