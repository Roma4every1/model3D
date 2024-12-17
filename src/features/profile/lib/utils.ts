import { MapLayer } from 'features/map/lib/map-layer';
import { getTotalBounds } from 'features/map/lib/bounds';
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
    const bounds = getTotalBounds(layer.elements);
    const info = {...layer, visible: true, bounds, highscale: '1000000', container: ''};
    layers.push(MapLayer.fromInfo(info, layer.elements));
  }
  return {onDrawEnd: () => {}, layers} as any;
}
