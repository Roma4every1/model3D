import { chunk } from 'lodash';
import { fillPatterns } from 'shared/drawing';
import { types } from '../../../drawer/map-drawer';
import { PIXEL_PER_METER } from '../../../lib/map-utils';


/** Функция, определяющая ширину текста внутри {@link HTMLCanvasElement}. */
type GetTextWidth = (text: string) => number;

/** Радиус выделения. */
export const SELECTION_RADIUS = 0.005;

export const polylineType: PolylineType = types['polyline'];

/** Снимает выделение с элемента карты. */
export function unselectElement(element: MapElement): void {
  element.selected = false;

  if (element.type === 'polyline' && element.fillname && !element.transparent) {
    const back = polylineType.bkcolor(element);
    element.fillStyle = fillPatterns.createFillStyle(element.fillname, element.fillcolor, back);
  }
}

/** Выделяет элемент карты. */
export function selectElement(element: MapElement): void {
  element.selected = true;

  if (element.type === 'polyline' && element.fillname && !element.transparent) {
    const back = polylineType.bkcolor(element);
    element.fillStyle = fillPatterns.createFillStyle(element.fillname, element.fillcolor, back);
  }
}

/** Является ли элемент карты линией с закрашенной площадью. */
export const isPolygon = (element: MapPolyline) => element.fillbkcolor && !element.transparent;

/** Проверяет подслой карты на видимость и соответствие масштабов. */
const checkLayer = (layer, scale: MapScale) => {
  const { visible, highscale: highScale, lowscale: lowScale } = layer;
  const condition = (typeof highScale === 'string' && highScale.includes('INF')) || scale < highScale;
  return visible && lowScale <= scale && condition;
}

/** Возвращает список ближайших элементов от места клика. */
export const getNearestElements = (layers: MapLayer[], activeLayer: MapLayer, scale: MapScale, filterFn: (layer) => boolean) => {
  let nearestElements = [];
  if (activeLayer) {
    nearestElements = activeLayer.elements.filter(filterFn);
  } else {
    for (const layer of layers) {
      if (checkLayer(layer, scale)) nearestElements.push(...layer.elements.filter(filterFn));
    }
  }
  nearestElements.reverse();
  return nearestElements;
};

/** Проверяет, достаточно ли далеко находится старая точка от новой. */
export const checkDistancePoints = (oldPoint: Point | null, newPoint: Point, scale: MapScale): boolean => {
  if (!oldPoint) return false;
  const dx = oldPoint.x - newPoint.x;
  const dy = oldPoint.y - newPoint.y;
  const r = SELECTION_RADIUS * scale;
  return (dx * dx) + (dy * dy) < (r * r);
};

/** Проверяет, достаточно ли далеко находится точка от подписи. */
const checkDistanceForLabel = (label: MapLabel, point: Point, scale: MapScale, getTextWidth: GetTextWidth): boolean => {
  const fontsize = (label.fontsize + (label.selected ? 2 : 0)) * (1 / 72 * 0.0254) * scale;
  const width = getTextWidth(label.text) * scale / PIXEL_PER_METER;

  const xx = point.x - (label.x + ((label.xoffset || 0) * 0.001 * scale));
  const yy = point.y - (label.y - ((label.yoffset || 0) * 0.001 * scale));
  const angle = label.angle / 180 * Math.PI;

  const xTrans = xx * Math.cos(angle) - yy * Math.sin(angle) + (width + 2) / 2 * label.halignment;
  const yTrans = xx * Math.sin(angle) + yy * Math.cos(angle) - (fontsize + 2) * (label.valignment / 2 - 1);
  return (0 <= xTrans) && (xTrans <= width) && (0 <= yTrans) && (yTrans <= fontsize + 3);
};

/** Проверяет, достаточно ли далеко сегмент находится от точки. */
const checkDistanceForSegment = (segment, point: Point, scale: MapScale): boolean => {
  const minDistance = SELECTION_RADIUS * scale;

  const aSquared = Math.pow(segment[0][0] - point.x, 2) + Math.pow(segment[0][1] - point.y, 2);
  if (aSquared < minDistance * minDistance) return true;

  const bSquared = Math.pow(segment[1][0] - point.x, 2) + Math.pow(segment[1][1] - point.y, 2);
  if (bSquared < minDistance * minDistance) return true;

  const cSquared = Math.pow(segment[1][0] - segment[0][0], 2) + Math.pow(segment[1][1] - segment[0][1], 2);
  if (aSquared > bSquared + cSquared || bSquared > aSquared + cSquared) return false;

  const c = Math.hypot(segment[1][0] - segment[0][0], segment[1][1] - segment[0][1]);
  const doubleSquare = Math.abs((segment[0][0] - point.x) * (segment[1][1] - point.y) - (segment[1][0] - point.x) * (segment[0][1] - point.y));
  return doubleSquare / c < minDistance;
};

/** Проверяет, достаточно ли далеко ломанная находится от точки. */
const checkDistanceForPolyline = (polyline: MapPolyline, point: Point, scale: MapScale): boolean => {
  let points = chunk(polyline.arcs[0].path, 2);
  if (polyline.arcs[0].closed) {
    points = [...points, points[0]];
  }

  for (let i = 0; i < points.length - 1; i++) {
    let segment = [points[i], points[i + 1]];
    if (checkDistanceForSegment(segment, point, scale)) return true;
  }
  return false;
};

/** Проверяет, достаточно ли далеко многоугольник находится от точки. */
const checkDistanceForPolygon = (polygon: MapPolyline, point: Point, scale: MapScale): boolean => {
  const ps = chunk<number>(polygon.arcs[0].path, 2);
  ps.pop();

  const x = point.x;
  const y = point.y;

  let inside = false;

  for (let i = 0, j = ps.length - 2; i < ps.length - 1; j = i++) {
    const xi = ps[i][0];
    const yi = ps[i][1];
    const xj = ps[j][0];
    const yj = ps[j][1];

    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  if (inside) return inside;
  else return checkDistanceForPolyline(polygon, point, scale);
}

/** Находит значения поля в заданной точке. */
const getInterpolatedFieldValue = (field: MapField, point: Point) => {
  const x = point.x;
  const y = point.y;
  if ( x === undefined || y === undefined || Number.isNaN(x) || Number.isNaN(y)) {
    return false;
  }

  const minX = field.x;
  const maxY = field.y;

  const maxX = minX + (field.sizex - 1) * field.stepx;
  const minY = maxY - (field.sizey - 1) * field.stepy;

  if (x < minX || maxX < x || y < minY || maxY < y) {
    return null;
  }

  const sX = 1 / field.stepx;
  const sY = 1 / field.stepy;

  const relativeToFieldX = x - minX;
  const relativeToFieldY = Math.abs(maxY - y);

  const j1 = Math.floor(relativeToFieldX * sX);
  const i1 = Math.floor(relativeToFieldY * sY);

  if (i1 >= field.sizey || j1 >= field.sizex
    || i1 < 0 || j1 < 0
    || i1 >= (field.sourceRenderDataMatrix.length-1))
    return null;

  const f00 = field.sourceRenderDataMatrix[i1][j1]
  const f10 = i1+1 === field.sizey ? null : field.sourceRenderDataMatrix[i1 + 1][j1];
  const f01 = j1+1 === field.sizex ? null : field.sourceRenderDataMatrix[i1][j1 + 1]
  const f11 = (i1+1 === field.sizex) && (j1+1 === field.sizey) ? null : field.sourceRenderDataMatrix[i1 + 1][j1 + 1]

  let s = 0;
  if (f00 != null) {
    s++;
  }
  if (f10 != null) {
    s++;
  }
  if (f01 != null) {
    s++;
  }
  if (f11 != null) {
    s++;
  }

  if (s <= 2) {
    return null;
  }

  const relativeToCellX = ((relativeToFieldX % field.stepx) * sX); // 1*
  const relativeToCellY = ((relativeToFieldY % field.stepy) * sY); // 1*
  const compositionXY = relativeToCellX * relativeToCellY; // 1*

  if (s === 3) {
    if (f00 == null) {
      let a = 1 - relativeToCellX;
      let b = 1 - relativeToCellY;
      let c = 1 - a - b;
      if (c < 0) {
        return null
      }
      return a * f10 + b * f01 + c * f11;
    }

    if (f01 == null) {
      let a = relativeToCellX;
      let b = 1 - relativeToCellY;
      let c = 1 - a - b;
      if (c < 0) {
        return null
      }
      return a * f11 + b * f00 + c * f10;
    }

    if (f10 == null) {
      let a = (1 - relativeToCellX);
      let b = relativeToCellY;
      let c = 1 - a - b;
      if (c < 0) {
        return null
      }
      return a * f00 + b * f11 + c * f01;
    }

    if (f11 == null) {
      let a = relativeToCellX;
      let b = relativeToCellY;
      let c = 1 - a - b;
      if (c < 0) {
        return null
      }
      return a * f01 + b * f10 + c * f00;
    }
  }

  // f(x) == f[0][0] * (1-x)(1-y) + f[1][0] * x(1-y) + f[0][1] * (1-x)y + f[1][1] * (1-x)(1-y)
  const comp1 = 1 - relativeToCellX - relativeToCellY + compositionXY; // (1-x)(1-y) == 1-x-y+xy // 0*
  const comp2 = relativeToCellX - compositionXY; // x(1-y) = x-xy // 0*
  const comp3 = relativeToCellY - compositionXY; // y(1-x) = y-xy // 0*

  return (f00 * comp1 + // 1*
    f01 * comp2 + // 1*
    f10 * comp3 + // 1*
    f11 * compositionXY) || null; // 1*
}

/** Проверяет, достаточно ли далеко поле находится от точки. */
const checkDistanceForField = (field: MapField, point: Point): boolean => {
  return getInterpolatedFieldValue(field, point) !== null;
}

/** Проверяет, достаточно ли далеко произвольный элемент карты находится от точки. */
export const checkDistance = (element: MapElement, point: Point, scale: MapScale, getTextWidth: GetTextWidth): boolean => {
  switch (element.type) {
    case 'polyline': {
      return isPolygon(element) ? checkDistanceForPolygon(element, point, scale) : checkDistanceForPolyline(element, point, scale);
    }
    case 'label': {
      return checkDistanceForLabel(element, point, scale, getTextWidth);
    }
    case 'sign': {
      return checkDistancePoints(element, point, scale);
    }
    case 'field': {
      return checkDistanceForField(element, point);
    }
    default: return false;
  }
};
