import type { MapLayerInfo } from './types';
import { getBoundsByPoints, PIXEL_PER_METER } from './map-utils';


/** Прототип объекта слоя трассы. */
export const traceLayerProto: MapLayerInfo = {
  uid: '{TRACES-LAYER}',
  name: 'Трасса',
  group: 'Временные пометки',
  container: 'null',
  highscale: 'INF',
  lowscale: '0',
  visible: true,
  bounds: {min: {x: 0, y: 0}, max: {x: 0, y: 0}},
};

/** Возвращает элемент карты polyline для отрисовки трассы */
export function getTraceMapElement(model: TraceModel): MapPolyline {
  const path: PolylineArcPath = [];
  model.nodes.forEach((node) => { path.push(node.x, node.y); });
  const arc: PolylineArc = {path, closed: false};

  return {
    type: 'polyline',
    arcs: [arc],
    bounds: getBoundsByPoints(path),
    borderstyle: 0,
    fillbkcolor: '#0000ff', fillcolor: '#0000ff',
    bordercolor: '#0000ff', borderwidth: 1.25,
    transparent: true, isTrace: true
  };
}

/** Определяет вьюпорт карты, чтобы трасса целиком влазила в экран. */
export function getFullTraceViewport(element: MapPolyline, canvas: MapCanvas): MapViewport {
  if (!canvas) return undefined;
  const { bounds: { min, max } } = element;

  const centerX = (min.x + max.x) / 2;
  const centerY = (min.y + max.y) / 2;

  const sizeX = Math.abs(max.x - min.x);
  const sizeY = Math.abs(max.y - min.y);

  const kScale = 1.2 * Math.max(sizeX / canvas.clientWidth, sizeY / canvas.clientHeight);
  return {centerX, centerY, scale: kScale * PIXEL_PER_METER};
}

/** Добавление/удаление точек к текущей трассе через клик по карте. */
export function handleTraceClick(model: TraceModel, mapPoint: MapPoint): void {
  const nodes = model.nodes;
  const nodeID = mapPoint.UWID;

  if (nodes.some(node => node.id === nodeID)) {
    model.nodes = nodes.filter(node => node.id !== nodeID);
  } else {
    const newNode: TraceNode = {
      id: nodeID, name: mapPoint.name,
      x: mapPoint.x, y: mapPoint.y,
    };
    model.nodes = [...nodes, newNode];
  }
}
