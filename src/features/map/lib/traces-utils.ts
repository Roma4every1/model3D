import {getBoundsByPoints} from "./map-utils";

/** Прототип объекта слоя трассы. */
export const traceLayerProto : MapLayer = {
  bounds: { min: {x: -10000000, y: -10000000}, max: {x: 10000000, y: 10000000} },
  container: 'null',
  elements: [],
  elementsData: Promise<MapElement[]>.resolve([]),
  group: 'Трассы',
  highscale: 'INF',
  lowscale: 'INF',
  name: 'Трассы',
  uid: '{TRACES-LAYER}',
  version: '123',
  visible: true,
}

/** Возвращает ID выбранной в глобальных параметрах трассы или null. */
export const getCurrentTraceUID = (currentTraceParam) => {
  return currentTraceParam
      ?.toString()
      .match(/ITEMS#(.+)#/)[1]
    || null;
}

/** Возвращает объект текущей трассы */
export const getCurrentTrace = (formID, points, currentTraceParam, traces) => {
  const currentTraceUID = getCurrentTraceUID(currentTraceParam);

  return traces.data.rows.find( row =>
    row.Cells[3]===currentTraceUID
  ) || null;

}

/** Возвращает элемент карты polyline для отрисовки трассы */
export const getCurrentTraceMapElement = (formID, points, currentTraceParam, traces) => {
  const currentTrace = getCurrentTrace(formID, points, currentTraceParam, traces);
  if (!currentTrace) return null;

  const traceWellsIDArray = currentTrace.Cells[3].split('---');
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

  const traceElement : MapPolyline = {
    type: 'polyline',
    attrTable: {},
    arcs: [traceArc],
    bounds: getBoundsByPoints([traceArcPath]),
    borderstyle: 0,
    fillbkcolor: '#0000ff', fillcolor: '#0000ff',
    bordercolor: '#0000ff', borderwidth: 1.25,
    transparent: true,
  };

  return traceElement;
}
