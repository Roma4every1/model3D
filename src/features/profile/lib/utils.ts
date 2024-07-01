import { MapLayer } from 'features/map/lib/map-layer';
import { types } from 'features/map/drawer/map-drawer';


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
