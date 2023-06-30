import { chunk, min, max } from 'lodash';
import { getParentFormId } from '../../../shared/lib';


/** Настройки для метода `addEventListener`. */
export const listenerOptions = {passive: true};

/** Количество пикселей в метре. В браузере `1cm = 96px / 2.54`. */
export const PIXEL_PER_METER: number = 100 * 96 / 2.54;

/** Возвращает список холстов привязанных карт в рамках одной мультикарты. */
export const getMultiMapChildrenCanvases = (multi: FormDict<MultiMapState>, single: FormDict<MapState>, formID: FormID) => {
  const childrenUtils: MapCanvas[] = [];
  const parentFormID: FormID = getParentFormId(formID);

  const multiMapState = multi[parentFormID];
  if (!multiMapState || !multiMapState.sync || multiMapState.children.length < 1)
    return childrenUtils;

  for (const childFormID of multiMapState.children) {
    if (childFormID === formID) continue;
    const mapState = single[childFormID];
    if (mapState?.canvas?.events) childrenUtils.push(mapState.canvas);
  }
  return childrenUtils;
}

/** Возвращает точку с координатами клика мыши. */
export const clientPoint = (event: MouseEvent): Point => {
  return {x: event.offsetX, y: event.offsetY};
};

/** Возвращает функцию для перевода точки клика из СК холста в СК карты. */
export const getPointToMap = (canvas: HTMLCanvasElement, cx: number, cy: number, scale: MapScale) => {
  const sc = 1 / PIXEL_PER_METER * scale;
  const canvasCX = canvas.clientWidth / 2;
  const canvasCY = canvas.clientHeight / 2;

  return (point: Point): Point => ({
    x: cx + (point.x - canvasCX) * sc,
    y: cy + (point.y - canvasCY) * sc
  });
};

/** Евклидово расстояние между двумя точками по их координатам.
 *
 * `√ (x1 - x2)^2 + (y1 - y2)^2`
 * */
export const distance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt((x1 * x1 + x2 * x2) + (y1 * y1 + y2 * y2) - 2 * (x1 * x2 + y1 * y2));
}

export const getBoundsByPoints = (points: any[]): Bounds => {
  const xValues = points.map(p => p[0]);
  const yValues = points.map(p => p[1]);
  return {min: {x: min(xValues), y: min(yValues)}, max: {x: max(xValues), y: max(yValues)}};
}

const SELECTION_RADIUS = 0.015;

export const getNearestPointIndex = (point: Point, scale: MapScale, polyline: MapPolyline): number => {
  let minRadius, nearestIndex: number | null = null;
  const points = chunk<number>(polyline.arcs[0].path, 2);

  points.forEach((p, i) => {
    //distance()
    const localDist = Math.sqrt(Math.pow(p[0] - point.x, 2) + Math.pow(p[1] - point.y, 2));
    if (!minRadius || localDist < minRadius) {
      minRadius = localDist;
      if ((minRadius / scale) < SELECTION_RADIUS) nearestIndex = i;
    }
  });
  return nearestIndex;
};

export const getNearestSegment = (point, polyline: MapPolyline) => {
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

export const squaredDistanceBetweenPointAndSegment = (segment, point) => {
  if (segment[0][0] === segment[1][0] && segment[0][1] === segment[1][1]) return Infinity;

  const aSquared = Math.pow(segment[0][0] - point.x, 2) + Math.pow(segment[0][1] - point.y, 2);
  const bSquared = Math.pow(segment[1][0] - point.x, 2) + Math.pow(segment[1][1] - point.y, 2);
  const cSquared = Math.pow(segment[1][0] - segment[0][0], 2) + Math.pow(segment[1][1] - segment[0][1], 2);

  if (aSquared > bSquared + cSquared) return bSquared;
  if (bSquared > aSquared + cSquared) return aSquared;

  const doubleSquare = Math.abs((segment[0][0] - point.x) * (segment[1][1] - point.y) - (segment[1][0] - point.x) * (segment[0][1] - point.y));
  const distance = doubleSquare * doubleSquare / cSquared;
  return isNaN(distance) ? Infinity : distance;
};

/** Определяет вьюпорт карты, чтобы все элементы влазили в экран. */
export const getFullViewport = (layers: MapLayer[], canvas: HTMLCanvasElement) => {
  const allVisibleBounds = layers.filter(l => l.visible).map(l => l.bounds);

  const minX = Math.min(...allVisibleBounds.map(b => b.min.x));
  const minY = Math.min(...allVisibleBounds.map(b => b.min.y));
  const maxX = Math.max(...allVisibleBounds.map(b => b.max.x));
  const maxY = Math.max(...allVisibleBounds.map(b => b.max.y));

  const scaleX = 1.2 * (maxX - minX) * PIXEL_PER_METER / canvas.clientWidth;
  const scaleY = 1.2 * (maxY - minY) * PIXEL_PER_METER / canvas.clientHeight;
  const scale: MapScale = Math.max(scaleX, scaleY);

  return {centerX: (minX + maxX) / 2, centerY: (minY + maxY) / 2, scale};
};
