import {getBoundsByPoints} from "./map-utils";
import {
  checkDistance,
  getNearestElements
} from "../components/edit-panel/selecting/selecting-utils";

/** Прототип объекта слоя трассы. */
export const traceLayerProto : MapLayer = {
  bounds: { min: {x: -10000000, y: -10000000}, max: {x: 10000000, y: 10000000} },
  container: 'null',
  elements: [],
  elementsData: Promise<MapElement[]>.resolve([]),
  group: 'Трассы',
  highscale: 1000000,
  lowscale: 0,
  name: 'Трассы',
  uid: '{TRACES-LAYER}',
  version: '1.0',
  visible: true,
}

/** Возвращает прототип объекта элемента трассы для карты с указанной в параметрах дугой. */
export const getTraceMapElementProto = (traceArc: PolylineArc) : MapPolyline => ({
  type: 'polyline',
  attrTable: {},
  arcs: [traceArc],
  bounds: getBoundsByPoints([traceArc.path]),
  borderstyle: 0,
  fillbkcolor: '#0000ff', fillcolor: '#0000ff',
  bordercolor: '#0000ff', borderwidth: 1.25,
  transparent: true,
})

/** Возвращает элемент карты polyline для отрисовки трассы */
export const getCurrentTraceMapElement = (formID, points, currentTraceRowCells) => {
  if(!currentTraceRowCells) return;
  const traceWellsIDArray = currentTraceRowCells.items.split('---');
  const traceWellsPoints = [...traceWellsIDArray.map(id => {
    const point = points.find(({UWID}) => UWID === id)
    if (!point) return null

    return [point.x, point.y]
  })];

  const traceArcPath : PolylineArcPath = traceWellsPoints.reduce(
    (newArray, el) => el ? [...newArray, ...el] : newArray, []
  );
  const traceArcPathLength = traceArcPath.length;
  const traceArcClosed = (
    traceArcPath[0]===traceArcPath[traceArcPathLength-2] &&
    traceArcPath[1]===traceArcPath[traceArcPathLength-1]
  );
  const traceArc: PolylineArc = {
    path: traceArcPath,
    closed: traceArcClosed
  };

  return getTraceMapElementProto(traceArc);
}

/** Получает ближайший элемент типа 'sign' на карте к указанной точке. */
export const getNearestSignMapElement = (point, canvas, scale, layers) => {
  const getTextWidth = (text) => canvas.getContext('2d').measureText(text).width;
  const filterFn = (element) => {
    if (element.type !== 'sign') return false;
    return checkDistance(element, point, scale, getTextWidth);
  }
  const nearestElements = getNearestElements(layers, null, scale, filterFn);

  const sign = nearestElements[0] as MapSign;
  if (!sign) return null;
  return {x: sign.x, y: sign.y} as ClientPoint;
}

/** Поиск точки из данных карты по коррдинатам. */
export const findMapPoint = (point: ClientPoint, mapPoints) => {
  if (!point || !mapPoints || !point.x || !point.y) return null;
  return mapPoints.find(p => (p.x === point.x) && (p.y === point.y)) ?? null;
}
