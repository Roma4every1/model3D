import { BaseAPI, API } from 'shared/lib';
import { types } from '../drawer/map-drawer';
import { provider } from '../drawer';
import { converter } from './maps-api.utils';
import { handleLayerScales, checkLayerIndex } from './maps-api.utils';
import symbolDef from 'assets/map-libs/symbol.def';


export class MapsAPI {
  constructor(private readonly baseAPI: BaseAPI) {}

  /** Загрузка файла с описаниями построения точечных элементов. */
  public async getSymbolsLib(): Promise<ArrayBuffer> {
    const response = await fetch(symbolDef, {credentials: 'include'});
    return response.arrayBuffer();
  }

  /** Загрузка легенды карты. */
  public async getMapLegend() {
    const query = {sessionId: this.baseAPI.sessionID};
    return await this.baseAPI.request<any>({path: 'mapLegends', query});
  }

  /** Запрос на сохранение карты. */
  public async saveMap(formID: FormID, mapID: MapID, mapData: any, owner: MapOwner) {
    const sessionId = this.baseAPI.sessionID;
    const data = {sessionId, formId: formID, mapId: mapID, mapData, owner};
    const body = converter.encode(JSON.stringify(data));
    return await this.baseAPI.request<any>({method: 'POST', path: 'saveMap', body});
  }

  /** Загрузка общих данных карты. */
  public async getMap(mapID: MapID, formID: FormID) {
    const query = {sessionId: this.baseAPI.sessionID, mapId: mapID, formId: formID};
    return await this.baseAPI.request<MapDataRaw>({path: 'getMap', query});
  }

  /** Загрузка контейнера карты. */
  public async getMapContainer(containerName: string, owner: MapOwner, index?: string) {
    const query = {sessionId: this.baseAPI.sessionID, owner, containerName, index};
    const req: WRequest = {path: 'getContainer', query, mapper: 'buffer'};
    const response = await this.baseAPI.request<ArrayBuffer>(req);
    if (response.ok === false) return response.data;
    return converter.parse(response.data);
  }

  /* --- Utils --- */

  /** Запрос именных точек. */
  public async setNamedPoints(mapData: MapDataRaw, owner: MapOwner, needReload = true): Promise<void> {
    const data = await this.getMapContainer(mapData.namedpoints, owner);
    if (typeof data === 'string') {
      if (needReload) {
        setTimeout(() => {
          this.setNamedPoints(mapData, owner, false);
        }, 500);
      } else {
        mapData.mapErrors.push('error loading named points from ' + mapData.namedpoints);
        mapData.points = [];
      }
      return;
    }
    mapData.points = data.namedpoints;
  }

  /** Запрос контейнеров и подготовка элементов слоя. */
  public async setLayerElements(
    mapData: MapDataRaw, layer: MapLayerRaw, indexName: string,
    owner: MapOwner, needReload = true,
  ): Promise<void> {
    let elements: MapElement[] = [];
    try {
      const data = await this.getMapContainer(layer.container, owner, indexName);
      if (typeof data === 'string') {
        if (needReload) {
          setTimeout(() => {
            this.setLayerElements(mapData, layer, indexName, owner, false);
          }, 500);
        } else {
          mapData.mapErrors.push(`error loading container ${layer.container}: ${data}`);
          // @ts-ignore
          layer.elements = [];
        }
        return;
      }

      const layerFromContainer = layer.uid.includes(layer.container)
        ? data.layers[layer.uid.replace(layer.container, '')]
        : data.layers[layer.uid];

      elements = layerFromContainer.elements;
      layer.version = layerFromContainer.version;

      if (elements.length === 0) {
        // try to find elements among of [layer name] layer into container
        const nameFromContainer = '[' + layerFromContainer.name + ']';
        const newLayer = Object.values<MapLayer>(data.layers).find((l) => l.name === nameFromContainer);
        if (newLayer != null) elements = newLayer.elements;
      }

      for (const element of elements) {
        const t = types[element.type];
        if (t && t.loaded) await t.loaded(element);
      }
    } finally {
      // @ts-ignore
      layer.elements = elements;
    }
  }

  /** Загрузка карты. */
  public async loadMap(mapID: MapID, owner: MapOwner, setProgress: Function, formID: FormID): Promise<MapData | string> {
    const response = await this.getMap(mapID, formID);
    if (!response.ok) return response.data as string;
    const mapData = response.data;
    mapData.mapErrors = [];

    await provider.initialize();
    await this.setNamedPoints(mapData, owner);

    let i = 1;
    const step = 100 / mapData.layers.length;

    for (const layer of mapData.layers) {
      handleLayerScales(layer);
      const indexName = checkLayerIndex(mapData, layer);
      await this.setLayerElements(mapData, layer, indexName, owner);

      if (mapData.mapErrors.length > 3) {
        const errors = mapData.mapErrors.join('\n');
        return 'More than 3 errors while load map:\n' + errors;
      }
      setProgress(Math.round(i * step)); i++;
    }
    return mapData as any as MapData;
  }
}

export const mapsAPI = new MapsAPI(API);
