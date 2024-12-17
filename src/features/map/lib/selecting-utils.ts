import { squaredDistance, squaredSegmentDistance } from 'shared/lib';
import { fillPatterns } from 'shared/drawing';
import { mapElementDrawers } from '../drawer/map-drawer.js';


/** Радиус выделения: количество метров в 10 пикселях. */
const selectionRadius = 0.0026;
/** Отрисовщик объектов типа "линия" на карте. */
export const polylineDrawer = mapElementDrawers.polyline;

/** Снимает выделение с элемента карты. */
export function unselectElement(element: MapElement): void {
  element.selected = false;
  element.edited = false;

  if (element.type === 'polyline' && element.fillname && !element.transparent) {
    const back = polylineDrawer.bkcolor(element);
    element.fillStyle = fillPatterns.createFillStyle(element.fillname, element.fillcolor, back);
  }
}

/** Выделяет элемент карты. */
export function selectElement(element: MapElement): void {
  element.selected = true;

  if (element.type === 'polyline' && element.fillname && !element.transparent) {
    const back = polylineDrawer.bkcolor(element);
    element.fillStyle = fillPatterns.createFillStyle(element.fillname, element.fillcolor, back);
  }
}

export function getNearestPointIndex({x, y}: Point, scale: MapScale, polyline: MapPolyline): number {
  let minDistance = Infinity;
  let nearestIndex: number;

  const path = polyline.arcs[0].path;
  const sr = (selectionRadius * scale) ** 2;

  for (let i = 0; i < path.length; i += 2) {
    const sd = squaredDistance(x, y, path[i], path[i + 1]);
    if (sd >= minDistance) continue;
    minDistance = sd;
    if (sd < sr) nearestIndex = i / 2;
  }
  return nearestIndex;
}

export function checkDistancePoints(oldPoint: Point | null, newPoint: Point, scale: MapScale): boolean {
  if (!oldPoint) return false;
  const r = selectionRadius * scale;
  const dx = oldPoint.x - newPoint.x;
  const dy = oldPoint.y - newPoint.y;
  return dx * dx + dy * dy < r * r;
}

export function checkDistanceForLabel(label: MapLabel, point: Point, scale: MapScale, ctx: CanvasRenderingContext2D): boolean {
  const fontsize = (label.fontsize + (label.selected ? 2 : 0)) * (1 / 72 * 0.0254) * scale;
  ctx.font = fontsize + 'px "' + label.fontname + '"';
  const width = ctx.measureText(label.text).width;

  const xx = point.x - (label.x + (label.xoffset * 0.001 * scale));
  const yy = point.y - (label.y - (label.yoffset * 0.001 * scale));
  const angle = label.angle / 180 * Math.PI;

  const xTrans = xx * Math.cos(angle) - yy * Math.sin(angle) + (width + 2) / 2 * label.halignment;
  const yTrans = xx * Math.sin(angle) + yy * Math.cos(angle) - (fontsize + 2) * (label.valignment / 2 - 1);
  return (0 <= xTrans) && (xTrans <= width) && (0 <= yTrans) && (yTrans <= fontsize + 3);
}

export function checkDistanceForPieSlice(pie: MapPieSlice, point: Point, scale: MapScale): boolean {
  let dx = pie.x - point.x;
  let dy = pie.y - point.y;
  let checkAngle: number;

  if (dx === 0) {
    checkAngle = (dy > 0) ? 0 : Math.PI;
  } else {
    checkAngle = Math.atan(dy / dx);
    checkAngle = (dx > 0) ? checkAngle + Math.PI / 2 : checkAngle + Math.PI / 2 * 3;
  }

  if (checkAngle <= pie.endangle && checkAngle >= pie.startangle) {
    const result = Math.sqrt((dx * dx) + (dy * dy)) - pie.radius * scale / 1000;
    return result <= 0;
  }
}

export function checkDistanceForPolyline(polyline: MapPolyline, point: Point, scale: MapScale): boolean {
  const { x, y } = point;
  const { path, closed } = polyline.arcs[0];

  let sd: number;
  const sr = (selectionRadius * scale) ** 2;
  let i = 0;
  const iMax = path.length - 2;

  while (i < iMax) {
    sd = squaredSegmentDistance(x, y, path[i], path[i + 1], path[i + 2], path[i + 3]);
    if (sd < sr) return true;
    i += 2;
  }
  if (closed) {
    sd = squaredSegmentDistance(x, y, path[i], path[i + 1], path[0], path[1]);
    return sd < sr;
  }
  return false;
}

export function checkDistanceForPolygon(polygon: MapPolyline, point: Point, scale: MapScale): boolean {
  const arc = polygon.arcs[0];
  if (isPointInPolygon(point, arc.path)) return true;
  return checkDistanceForPolyline(polygon, point, scale);
}

function isPointInPolygon({x, y}: Point, polygon: number[]): boolean {
  if (polygon.length < 6) return false;
  const len = polygon.length;
  let intersections = 0;

  for (let i = 0; i < len; i += 2) {
    const x1 = polygon[i], y1 = polygon[i + 1];
    const x2 = polygon[(i + 2) % len], y2 = polygon[(i + 3) % len];

    // пересекает ли горизонтальный луч ребро многоугольника
    if (y1 > y !== y2 > y && x < ((x2 - x1) * (y - y1)) / (y2 - y1) + x1) ++intersections;
  }
  return intersections % 2 === 1;
}

export function checkDistanceForField(field: MapField, point: Point): boolean {
  return getInterpolatedFieldValue(field, point) !== null;
}

/** Находит значения поля в заданной точке. */
function getInterpolatedFieldValue(field: MapField, point: Point) {
  const x = point.x;
  const y = point.y;
  if (x === undefined || y === undefined || Number.isNaN(x) || Number.isNaN(y)) {
    return null;
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
  if (f00 != null) s++;
  if (f10 != null) s++;
  if (f01 != null) s++;
  if (f11 != null) s++;
  if (s <= 2) return null;

  const relativeToCellX = ((relativeToFieldX % field.stepx) * sX); // 1*
  const relativeToCellY = ((relativeToFieldY % field.stepy) * sY); // 1*
  const compositionXY = relativeToCellX * relativeToCellY; // 1*

  if (s === 3) {
    if (f00 == null) {
      const a = 1 - relativeToCellX;
      const b = 1 - relativeToCellY;
      const c = 1 - a - b;
      if (c < 0) return null
      return a * f10 + b * f01 + c * f11;
    }

    if (f01 == null) {
      const a = relativeToCellX;
      const b = 1 - relativeToCellY;
      const c = 1 - a - b;
      if (c < 0) return null
      return a * f11 + b * f00 + c * f10;
    }

    if (f10 == null) {
      const a = (1 - relativeToCellX);
      const b = relativeToCellY;
      const c = 1 - a - b;
      if (c < 0) return null
      return a * f00 + b * f11 + c * f01;
    }

    if (f11 == null) {
      const a = relativeToCellX;
      const b = relativeToCellY;
      const c = 1 - a - b;
      if (c < 0) return null
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
