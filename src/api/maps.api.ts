import { Requester } from './api';
import { converter } from '../utils/maps-api.utils';
import { handleLayerScales, checkLayerIndex, loadLayerElements } from '../utils/maps-api.utils';

import symbolDef from '../assets/libs/symbol.def';
import dro32Lib from '../assets/libs/dro32_.smb';
import gridsLib from '../assets/libs/grids.smb';
import litLib from '../assets/libs/lit.smb';
import regionalLib from '../assets/libs/regional.smb';


export class MapsAPI {
  private static libsDict = {
    'dro32_': dro32Lib,
    'grids': gridsLib,
    'lit': litLib,
    'regional': regionalLib
  };

  constructor(private readonly requester: Requester) {}

  private async request<Expected>(req: WRequest) {
    return this.requester.request<Expected>(req);
  }

  /** Загрузка файла с описаниями построения точечных элементов. */
  public async getSymbolsLib(): Promise<Uint8Array> {
    const response = await fetch(symbolDef, {credentials: 'include'});
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }

  /** Загрузка файлов с описаниями паттернов линий для отрисовки карт. */
  public async getPatternLib(libraryID: string): Promise<Uint8Array> {
    const libName = MapsAPI.libsDict[libraryID.toLowerCase()];
    if (!libName) throw new Error(`unknown library "${libraryID}"`);
    const response = await fetch(libName, {credentials: 'include'});
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }

  /** Загрузка легенды карты. */
  public async getMapLegend(): Promise<Res<any>> {
    const query = {sessionId: this.requester.sessionID};
    return await this.request<any>({path: 'mapLegends', query});
  }

  /** Запрос на сохранение карты. */
  public async saveMap(formID: FormID, mapID: MapID, mapData: any, owner: MapOwner) {
    const sessionId = this.requester.sessionID;
    const data = {sessionId, formId: formID, mapId: mapID, mapData, owner};
    const body = converter.encode(JSON.stringify(data));
    return await this.request<any>({method: 'POST', path: 'saveMap', body});
  }

  /** Загрузка общих данных карты. */
  public async getMap(mapID: MapID): Promise<Res<MapDataRaw>> {
    const query = {sessionId: this.requester.sessionID, mapId: mapID};
    return await this.request<MapDataRaw>({path: 'getMap', query});
  }

  /** Загрузка контейнера карты. */
  public async getMapContainer(containerName: string, owner: MapOwner, index?: string): Promise<ParsedContainer | string> {
    const query = {sessionId: this.requester.sessionID, owner, containerName, index};
    const response = await this.request<ArrayBuffer>({path: 'getContainer', query, mapper: 'buffer'});
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

      await loadLayerElements(elements);
    } finally {
      // @ts-ignore
      layer.elements = elements;
    }
  }

  /** Загрузка карты. */
  public async loadMap(mapID: MapID, owner: MapOwner, setProgress: Function): Promise<MapData | string> {
    const response = await this.getMap(mapID);
    if (!response.ok) return response.data as string;
    const mapData = response.data;
    mapData.mapErrors = [];

    await this.setNamedPoints(mapData, owner);

    let i = 1;
    const step = Math.ceil(100 / mapData.layers.length);

    for (const layer of mapData.layers) {
      handleLayerScales(layer);
      const indexName = checkLayerIndex(mapData, layer);
      await this.setLayerElements(mapData, layer, indexName, owner);

      if (mapData.mapErrors.length > 3) {
        const errors = mapData.mapErrors.join('\n');
        return 'More than 3 errors while load map:\n' + errors;
      }
      setProgress(i * step); i++;
    }
    return mapData as any as MapData;
  }
}
