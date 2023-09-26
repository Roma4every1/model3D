import { getBoundsByPoints, PIXEL_PER_METER } from './map-utils';
import { checkDistancePoints } from './selecting-utils.ts';


/** Прототип объекта слоя трассы. */
export const traceLayerProto: MapLayerRaw = {
  bounds: {min: {x: 0, y: 0}, max: {x: 0, y: 0}},
  container: 'null',
  group: 'Трассы',
  highscale: 'INF',
  lowscale: 0,
  name: 'Трассы',
  uid: '{TRACES-LAYER}',
  version: '1.0',
  visible: true,
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

/** Обновляет узлы трассы после клика по карте. */
export function handleClick(model: TraceModel, eventPoint: Point, mapData: MapData): boolean {
  const nearestPoint = mapData.points.find(p => checkDistancePoints(eventPoint, p, mapData.scale));
  if (!nearestPoint) return false;

  const nodes = model.nodes;
  const nodeID = parseInt(nearestPoint.UWID);

  if (nodes.some(node => node.id === nodeID)) {
    model.nodes = nodes.filter(node => node.id !== nodeID);
  } else {
    const newNode: TraceNode = {
      id: nodeID, name: nearestPoint.name,
      x: nearestPoint.x, y: nearestPoint.y,
    };
    model.nodes = [...nodes, newNode];
  }
  return true;
}
