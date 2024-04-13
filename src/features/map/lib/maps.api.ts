import { Res, Fetcher, fetcher } from 'shared/lib';
import { types } from '../drawer/map-drawer';
import { provider } from '../drawer';
import { converter } from './maps-api.utils';
import { checkLayerIndex } from './maps-api.utils';
import { MapLayer } from './map-layer.ts';
import symbolDef from 'assets/map-libs/symbol.def';


export class MapsAPI {
  constructor(private readonly api: Fetcher) {}

  /** Загрузка файла с описаниями построения точечных элементов. */
  public async getSymbolsLib(): Promise<ArrayBuffer> {
    const response = await fetch(symbolDef, {credentials: 'include'});
    return response.arrayBuffer();
  }

  /** Запрос на сохранение карты. */
  public saveMap(formID: FormID, mapID: MapID, mapData: any, owner: MapOwner): Promise<Res> {
    const data = {formId: formID, mapId: mapID, mapData, owner};
    return this.api.post('/saveMap', {blob: converter.encode(JSON.stringify(data))});
  }

  /** Загрузка общих данных карты. */
  public getMap(mapID: MapID, formID: FormID): Promise<Res<MapDataRaw>> {
    return this.api.get('/getMap', {query: {mapId: mapID, formId: formID}});
  }

  /** Загрузка контейнера карты. */
  public async getMapContainer(containerName: string, owner: MapOwner, index?: string) {
    const query = {owner, containerName, index};
    const res = await this.api.get('/getContainer', {query, then: 'arrayBuffer'});
    if (res.ok === false) return res.message;
    return converter.parse(res.data);
  }

  /* --- Utils --- */

  /** Запрос именных точек. */
  public async setNamedPoints(mapData: MapDataRaw, owner: MapOwner): Promise<void> {
    const data = await this.getMapContainer(mapData.namedpoints, owner);
    if (typeof data === 'string') {
      mapData.mapErrors.push('error loading named points from ' + mapData.namedpoints);
      mapData.points = [];
    } else {
      mapData.points = data.namedpoints;
    }
  }

  /** Загрузка карты. */
  public async loadMap(mapID: MapID, owner: MapOwner, setLoading: (l: any) => void, formID: FormID): Promise<MapData | string> {
    const response = await this.getMap(mapID, formID);
    if (!response.ok) return response.message;
    const mapData = response.data;
    mapData.mapErrors = [];

    await provider.initialize();
    await this.setNamedPoints(mapData, owner);

    let layerCounter = 0;
    const step = 100 / mapData.layers.length;
    const layers: MapLayer[] = [];

    for (const rawLayer of mapData.layers) {
      setLoading({percentage: Math.round(layerCounter * step), status: rawLayer.name});
      const indexName = checkLayerIndex(mapData, rawLayer);
      layers.push(await this.createLayer(mapData, rawLayer, indexName, owner));

      if (mapData.mapErrors.length > 3) {
        const errors = mapData.mapErrors.join('\n');
        return 'More than 3 errors while load map:\n' + errors;
      }
      layerCounter++;
    }
    mapData.layers = layers as any;
    return mapData as any as MapData;
  }

  /** Запрос контейнеров и подготовка элементов слоя. */
  private async createLayer(
    mapData: MapDataRaw, layer: MapLayerRaw, indexName: string,
    owner: MapOwner,
  ): Promise<MapLayer> {
    try {
      const data = await this.getMapContainer(layer.container, owner, indexName);
      if (typeof data === 'string') {
        mapData.mapErrors.push(`error loading container ${layer.container}: ${data}`);
        return new MapLayer(layer, []);
      }

      const layerFromContainer = layer.uid.includes(layer.container)
        ? data.layers[layer.uid.replace(layer.container, '')]
        : data.layers[layer.uid];

      const elements = layerFromContainer.elements;
      layer.version = layerFromContainer.version;

      for (const element of elements) {
        const t = types[element.type];
        if (t && t.loaded) await t.loaded(element);
      }
      return new MapLayer(layer, elements);
    } catch {
      return new MapLayer(layer, []);
    }
  }
}

export const mapsAPI = new MapsAPI(fetcher);
