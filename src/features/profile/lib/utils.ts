import { MapLayer } from 'features/map/lib/map-layer';
import { types } from 'features/map/drawer/map-drawer';
import { prepareMapElements } from 'features/map/loader/prepare';


/** Преобразует данные из контейнера профиля к данным карты (MapData). */
export async function getProfileMapData(data: Record<string, GMRawLayerData>): Promise<MapData> {
  const layers: MapLayer[] = [];
  const values = Object.values(data);

  for (const layer of values) {
    await prepareMapElements(layer.elements);
    for (const element of layer.elements) {
      if (element.type === 'polyline' && element.fillname) {
        for (const arc of element.arcs) arc.closed = true;
      }
    }
    const bounds = getBounds(layer.elements);
    const info = {...layer, visible: true, bounds, highscale: '1000000', container: ''};
    layers.push(MapLayer.fromInfo(info, layer.elements));
  }
  return {onDrawEnd: () => {}, layers} as any;
}

/** Возвращает границы для группы слоев или элементов. */
export function getBounds(elements: MapElement[] | MapLayer[]): Bounds {
  const min: Point = {x: Infinity, y: Infinity};
  const max: Point = {x: -Infinity, y: -Infinity};

  elements.map((el) => {
    if (!el.bounds) {
      const elementDrawer = types[el.type];
      el.bounds = elementDrawer.bound(el);
    }

    min.x = Math.min(el.bounds.min.x, min.x);
    min.y = Math.min(el.bounds.min.y, min.y);
    max.x = Math.max(el.bounds.max.x, max.x);
    max.y = Math.max(el.bounds.max.y, max.y);
  });
  return {min, max};
}
