import { MapLayer } from './map-layer';
import { mapAPI } from './map.api';
import { types } from '../drawer/map-drawer';
import { provider } from '../drawer';


/** Загрузчик данных карты. */
export class MapLoader implements IMapLoader {
  /** ID формы, для которой загрузчик создан. */
  private readonly formID: FormID;
  /** Функция, которая будет вызываться при постепенном увеличении прогресса загрузки. */
  public readonly onProgressChange: (l: MapLoading) => void;

  /** Контроллер прерывания. */
  private abortController: AbortController;
  /** Накопитель для ошибок, возникающих во время загрузки. */
  private errors: string[];

  constructor(formID: FormID) {
    this.formID = formID;
  }

  public loadMapData(mapID: MapID, owner: MapStorageID): Promise<MapData | string | null> {
    this.abortLoading();
    this.abortController = new AbortController();
    this.errors = [];

    const cbCatch = (e: Error) => {
      if (e instanceof DOMException) return null; // aborted
      this.clear();
      return e.message;
    };
    const cbThen = (data: MapData) => {
      this.clear();
      return data;
    };
    return this.loadMap(mapID, owner).then(cbThen).catch(cbCatch);
  }

  public abortLoading(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.clear();
    }
  }

  private clear(): void {
    this.abortController = null;
    this.errors = null;
  }

  /** Загрузка карты. */
  private async loadMap(mapID: MapID, owner: MapStorageID): Promise<MapData> {
    const response = await mapAPI.getMap(mapID, this.formID, this.abortController.signal);
    if (!response.ok) throw new Error('Ошибка при получении данных карты');

    const mapData = response.data;
    const rawLayers: MapLayerRaw[] = mapData.layers;
    mapData.mapErrors = this.errors;

    await provider.initialize();
    mapData.points = await this.loadNamedPoints(mapData.namedpoints, owner);

    let layerCounter = 0;
    const step = 100 / rawLayers.length;
    const layers: MapLayer[] = [];

    for (const rawLayer of rawLayers) {
      if (this.onProgressChange) {
        const percentage = Math.round(layerCounter * step);
        this.onProgressChange({percentage, status: rawLayer.name});
      }
      const indexName = checkLayerIndex(mapData, rawLayer);
      const layer = await this.createLayer(rawLayer, indexName, owner);

      if (this.errors.length > 3) {
        const errors = this.errors.join('\n');
        throw new Error('Более 3 ошибок при загрузке карты:\n' + errors);
      }
      layers.push(layer ?? new MapLayer(rawLayer, []));
      layerCounter++;
    }

    mapData.layers = layers as any;
    return mapData as any as MapData;
  }

  /** Запрос контейнеров и подготовка элементов слоя. */
  private async createLayer(layer: MapLayerRaw, index: string, owner: MapStorageID): Promise<MapLayer> {
    try {
      const signal = this.abortController.signal;
      const res = await mapAPI.getMapContainer(layer.container, owner, index, signal);

      if (!res.ok) {
        const error = `Ошибка при загрузке контейнера ${layer.container}: ${res.message}`;
        this.errors.push(error); return;
      }
      const layerFromContainer = layer.uid.includes(layer.container)
        ? res.data.layers[layer.uid.replace(layer.container, '')]
        : res.data.layers[layer.uid];

      const elements = layerFromContainer.elements;
      layer.version = layerFromContainer.version;

      for (const element of elements) {
        const bounds = element.bounds;
        if (bounds && bounds.length === 1) element.bounds = bounds[0];

        const t = types[element.type];
        if (t && t.loaded) await t.loaded(element);
      }
      return new MapLayer(layer, elements);
    } catch (e) {
      if (e instanceof DOMException) throw e; // aborted
      const error = `Ошибка при обработке контейнера ${layer.container}: ${e.message}`;
      this.errors.push(error);
    }
  }

  /** Запрос именных точек. */
  private async loadNamedPoints(name: string, owner: MapStorageID): Promise<MapPoint[]> {
    const { ok, data } = await mapAPI.getMapContainer(name, owner, undefined, this.abortController.signal);
    if (ok) return data.namedpoints;
    this.errors.push('Ошибка при загрузке точек карты из контейнера ' + name);
    return [];
  }
}

export function checkLayerIndex(mapData: MapDataRaw, layer: MapLayerRaw) {
  let indexName = null;
  if (!mapData.indexes || !mapData.indexes.length) return indexName;

  const indexes = [];
  const indexesForContainer = mapData.indexes.find(i => i.container === layer.container);

  if (indexesForContainer) {
    indexesForContainer.data.forEach((idx) => {
      if (idx.maxx >= 0 && idx.minx < 0 && idx.maxy >= 0 && idx.miny < 0) indexes.push(idx);
    });

    let scaleDif = 0;
    indexes.forEach((idx) => {
      const diff = idx.scale - 10000;
      if (scaleDif <= 0 || (diff < scaleDif && diff > 0)) {
        scaleDif = diff; indexName = idx.hash;
      }
    });

    if (!indexName && indexesForContainer.data.length > 0) {
      indexName = indexesForContainer.data[0].hash;
    }
  }
  if (indexName) layer.index = indexName;
  return indexName;
}
