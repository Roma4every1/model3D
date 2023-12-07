import {MapLayer} from "../../map/lib/map-layer.ts";
import {types} from "../../map/drawer/map-drawer.js";

/** Получает набор точек трассы с заданным шагом по расстоянию вдоль трассы. */
export const getTraceLines = (nodes: any, step = 200) => {
  if (!nodes) return null;
  let resultPoints = [];
  let resultDistance = 0;
  let lastLineRemainder = 0;
  for (let i = 1; i < nodes.length; i++) {
    const line = getTraceLinePoints(nodes[i - 1], nodes[i], step, lastLineRemainder)
    resultPoints = [...resultPoints, ...line.points];
    resultDistance += line.distance;
    lastLineRemainder = line.remainder;
  }
  return {
    points: resultPoints,
    distance: resultDistance
  };
}

/** Получает набор точек с шагом вдоль трассы между двумя узлами трассы. */
export const getTraceLinePoints = (node1: TraceNode, node2: TraceNode, step = 200, remainder = 0) => {
  const result = [];

  const distance = Math.sqrt(Math.pow(node1.x - node2.x, 2) +
    Math.pow(node1.y - node2.y, 2))

  let newRemainder = 0;
  for (let c = step - remainder; c < distance; c += step) {
    newRemainder = distance - c;
    result.push({
      x: node1.x + c / distance * (node2.x - node1.x),
      y: node1.y + c / distance * (node2.y - node1.y),
    })
  }

  return {
    points: result,
    remainder: newRemainder,
    distance
  };
}

/** Получает расстояние между двумя точками. */
export const getPointsDistance2D = (point1: Point, point2: Point) => {
  return Math.sqrt(Math.pow(point1.x - point2.x, 2) +
    Math.pow(point1.y - point2.y, 2))
}

export const getPointsDistance3D = (point1: Point, point2: Point, depth1: number, depth2: number) => {
  return Math.sqrt(Math.pow(point1.x - point2.x, 2) +
    Math.pow(point1.y - point2.y, 2) + Math.pow(depth1 - depth2, 2));
}

/** Преобразует данные из контейнера профиля к данным карты (MapData) */
export const getProfileMapData = async (data: Record<string, GMMORawLayerData>): Promise<MapData> => {
  const array = Object.values(data);
  const layers: MapLayer[] = [];

  for (const l of array) {
    const elements = l.elements;

    for (const element of elements) {
      const t = types[element.type];
      if (t && t.loaded) await t.loaded(element);
      if (element.type === 'polyline' && element.fillname)
        element.arcs.forEach(a => a.closed=true)
    }

    layers.push(new MapLayer({
        ...l,
        visible: true,
        bounds: getBounds(l.elements),
        highscale: 1000000,
        container: ''
      }, elements));
  }

  return {
    onDrawEnd: () => {},
    layers,
  } as unknown as MapData;
}

/** Возвращает границы для группы слоев или элементов. */
export const getBounds = (elements: MapElement[] | MapLayer[]): Bounds => {
  const min: Point = {x: Infinity, y: Infinity};
  const max: Point = {x: -Infinity, y: -Infinity};

  elements.map(el => {
    if (!el.bounds) {
      const elementDrawer = types[el.type];
      el.bounds = elementDrawer.bound(el);
    }

    min.x = Math.min(el.bounds.min.x, min.x);
    min.y = Math.min(el.bounds.min.y, min.y);

    max.x = Math.max(el.bounds.max.x, max.x);
    max.y = Math.max(el.bounds.max.y, max.y);
  })

  return {min, max};
}
