import { getBoundsByPoints, PIXEL_PER_METER } from './map-utils';
import { checkDistance, getNearestElements } from '../components/edit-panel/selecting/selecting-utils';


/** Прототип объекта слоя трассы. */
export const traceLayerProto : MapLayer = {
  bounds: {min: {x: -10000000, y: -10000000}, max: {x: 10000000, y: 10000000}},
  container: 'null',
  elements: [],
  elementsData: Promise.resolve([]),
  group: 'Трассы',
  highscale: 'INF',
  lowscale: 0,
  name: 'Трассы',
  uid: '{TRACES-LAYER}',
  version: '1.0',
  visible: true,
  temporary: true,
}

/** Возвращает прототип объекта элемента трассы для карты с указанной в параметрах дугой. */
export const getTraceMapElementProto = (traceArc: PolylineArc): MapPolyline => ({
  type: 'polyline',
  attrTable: {},
  arcs: [traceArc],
  bounds: getBoundsByPoints([traceArc.path]),
  borderstyle: 0,
  fillbkcolor: '#0000ff', fillcolor: '#0000ff',
  bordercolor: '#0000ff', borderwidth: 1.25,
  transparent: true,
  isTrace: true
});

/** Возвращает элемент карты polyline для отрисовки трассы */
export function getCurrentTraceMapElement(points: MapPoint[], model: TraceModel) {
  if (!model?.nodes) return;
  const path: PolylineArcPath = [];

  for (const node of model.nodes) {
    const id = node.id.toString();
    const point = points.find(p => p.UWID === id);
    if (point) path.push(point.x, point.y);
  }
  const closed = path[0] === path[path.length - 2] && path[1] === path[path.length - 1];
  return getTraceMapElementProto({path, closed});
}

/** Получает ближайший элемент типа 'sign' на карте к указанной точке. */
export function getNearestSignMapElement(point, canvas, scale, layers): Point | null {
  const getTextWidth = (text) => canvas.getContext('2d').measureText(text).width;
  const filterFn = (element) => {
    if (element.type !== 'sign') return false;
    return checkDistance(element, point, scale, getTextWidth);
  };

  const nearestElements: MapSign[] = getNearestElements(layers, null, scale, filterFn);
  const sign = nearestElements[0];
  return sign ? {x: sign.x, y: sign.y} : null;
}

/** Поиск точки из данных карты по коррдинатам. */
export function findMapPoint(point: Point, mapPoints: MapPoint[]): MapPoint | null {
  if (!point || !mapPoints || !point.x || !point.y) return null;
  return mapPoints.find(p => (p.x === point.x) && (p.y === point.y)) ?? null;
}

/** Определяет вьюпорт карты, чтобы трасса целиком влазила в экран. */
export function getFullTraceViewport(element: MapPolyline, canvas: HTMLCanvasElement) {
  if (!canvas?.width || !canvas?.height || !element) return null;
  if (element) {
    const { bounds: { min, max } } = element;
    const centerX = (min.x + max.y) / 2;
    const centerY = (min.y + max.y) / 2;

    // размеры прямоугольника, описывающего трассу
    const sizeX = Math.abs(Math.abs(max.x) - Math.abs(min.x));
    const sizeY = Math.abs(Math.abs(max.y) - Math.abs(min.y));

    const kScale = Math.max(sizeX / canvas.width, sizeY / canvas.height);
    if (!isFinite(centerX) || !isFinite(centerY) || !isFinite(kScale)) return null;
    return {centerX, centerY, scale: kScale * PIXEL_PER_METER * 1.4};
  }
  return null;
}
