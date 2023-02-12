import { chunk } from 'lodash';
import { types } from '../../../drawer/map-drawer';
import { PIXEL_PER_METER } from '../../../lib/map-utils';


/** Функция, определяющая ширину текста внутри {@link HTMLCanvasElement}. */
type GetTextWidth = (text: string) => number;

/** Радиус выделения. */
export const SELECTION_RADIUS = 0.005;

export const polylineType: PolylineType = types['polyline'];

/** Есть ли у элемента какой-либо паттерн закраски. */
const hasPattern = (element: MapPolyline): boolean => {
  return element.fillname && !element.transparent;
}

/** Получить паттерн по элементу. */
export const getPattern = async (element: MapPolyline) => {
  return await polylineType.getPattern(element.fillname, element.fillcolor, polylineType.bkcolor(element));
}

/** Снимает выделение с элемента карты. */
export const unselectElement = async (element: MapElement): Promise<void> => {
  element.selected = false;

  if (element.type === 'polyline' && hasPattern(element)) {
    element.img = await getPattern(element);
  }
}

/** Выделяет элемент карты. */
export const selectElement = async (element: MapElement): Promise<void> => {
  element.selected = true;

  if (element.type === 'polyline' && hasPattern(element)) {
    element.img = await getPattern(element);
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
export const checkDistancePoints = (oldPoint: ClientPoint | null, newPoint: ClientPoint, scale: MapScale): boolean => {
  if (!oldPoint) return false;
  const dx = oldPoint.x - newPoint.x;
  const dy = oldPoint.y - newPoint.y;
  const r = SELECTION_RADIUS * scale;
  return (dx * dx) + (dy * dy) < (r * r);
};

/** Проверяет, достаточно ли далеко находится точка от подписи. */
const checkDistanceForLabel = (label: MapLabel, point: ClientPoint, scale: MapScale, getTextWidth: GetTextWidth): boolean => {
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
const checkDistanceForSegment = (segment, point: ClientPoint, scale: MapScale): boolean => {
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
const checkDistanceForPolyline = (polyline: MapPolyline, point: ClientPoint, scale: MapScale): boolean => {
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
const checkDistanceForPolygon = (polygon: MapPolyline, point: ClientPoint): boolean => {
  let sum = 0;
  // ps - сокращение от "points"
  let ps = chunk<number>(polygon.arcs[0].path, 2);
  ps = [...(ps.map(p => [p[0] - point.x, p[1] - point.y])), [ps[0][0] - point.x, ps[0][1] - point.y]];

  for (let i = 0; i < ps.length - 1; i++) {
    const tg1 =
      (ps[i][0] * ps[i][0] + ps[i][1] * ps[i][1] - ps[i][0] * ps[i + 1][0] - ps[i][1] * ps[i + 1][1]) /
      (ps[i][0] * ps[i + 1][1] - ps[i][1] * ps[i + 1][0]);

    const tg2 =
      (ps[i + 1][0] * ps[i + 1][0] + ps[i + 1][1] * ps[i + 1][1] - ps[i][0] * ps[i + 1][0] - ps[i][1] * ps[i + 1][1]) /
      (ps[i][0] * ps[i + 1][1] - ps[i][1] * ps[i + 1][0]);

    sum += Math.atan(tg1) + Math.atan(tg2);
  }
  return Math.abs(sum) > 0.0000001;
};

/** Проверяет, достаточно ли далеко произвольный элемент карты находится от точки. */
export const checkDistance = (element: MapElement, point: ClientPoint, scale: MapScale, getTextWidth: GetTextWidth): boolean => {
  switch (element.type) {
    case 'polyline': {
      return isPolygon(element)
        ? checkDistanceForPolygon(element, point)
        : checkDistanceForPolyline(element, point, scale);
    }
    case 'label': {
      return checkDistanceForLabel(element, point, scale, getTextWidth);
    }
    case 'sign': {
      return checkDistancePoints(element, point, scale);
    }
    default: return false;
  }
};
