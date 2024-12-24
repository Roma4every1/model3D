import type { MapInfo, MapLayerInfo } from '../lib/types.dto';
import type { MapContainer } from './container-parser';
import { MapLayer } from '../lib/map-layer';
import { mapAPI } from './map.api';
import { signProvider } from '../drawer/sign-provider';
import { parseMapContainer } from './container-parser';
import { prepareMapElements } from './prepare';


/** Загрузчик данных карты. */
export class MapLoader {
  /** ID формы, для которой загрузчик создан. */
  private readonly formID: FormID;
  /** Контроллер прерывания. */
  private abortController: AbortController;
  /** Накопитель для ошибок, возникающих во время загрузки. */
  private errorCounter: number;

  constructor(formID: FormID) {
    this.formID = formID;
  }

  public loadMapData(mapID: MapID, storageID: MapStorageID): Promise<MapData | string | null> {
    this.abortLoading();
    this.abortController = new AbortController();
    this.errorCounter = 0;

    const cbCatch = (e: Error) => {
      if (e instanceof DOMException) return null; // aborted
      this.clear();
      return e.message;
    };
    const cbThen = (data: MapData) => {
      this.clear();
      return data;
    };
    return this.loadMap(mapID, storageID).then(cbThen).catch(cbCatch);
  }

  public abortLoading(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.clear();
    }
  }

  private clear(): void {
    this.abortController = null;
    this.errorCounter = 0;
  }

  private async loadMap(mapID: MapID, storageID: MapStorageID): Promise<MapData> {
    const res = await mapAPI.getMapInfo(mapID, this.formID, this.abortController.signal);
    if (!res.ok) throw new Error('Ошибка при получении данных карты');
    await signProvider.initialize();

    const mapInfo = res.data;
    const containers = await this.loadContainers(mapInfo, storageID);

    const layers: MapLayer[] = [];
    const points = containers[mapInfo.namedpoints].points;

    for (const layerInfo of mapInfo.layers) {
      const layer = await this.createLayer(layerInfo, containers);
      if (this.errorCounter > 3) throw new Error();
      if (layer) layers.push(layer);
    }
    return {...mapInfo, layers, points};
  }

  private async createLayer(info: MapLayerInfo, data: Record<string, MapContainer>): Promise<MapLayer> {
    try {
      const containerName = info.container;
      const container = data[containerName];
      if (!container) return null;

      const layerElements = info.uid.includes(containerName)
        ? container.layers[info.uid.replace(containerName, '')]
        : container.layers[info.uid];

      await prepareMapElements(layerElements);
      return MapLayer.fromInfo(info, layerElements);
    } catch (e) {
      if (e instanceof DOMException) throw e; // aborted
      ++this.errorCounter;
      return null;
    }
  }

  private async loadContainers(mapInfo: MapInfo, storage: MapStorageID): Promise<Record<string, MapContainer>> {
    const containerNames: string[] = [mapInfo.namedpoints];
    for (const { container } of mapInfo.layers) {
      if (!containerNames.includes(container)) containerNames.push(container);
    }

    const load = (name: string) => this.loadContainer(name, storage);
    const containers = await Promise.all(containerNames.map(load));

    const result: Record<string, MapContainer> = {};
    for (let i = 0; i < containerNames.length; ++i) {
      const container = containers[i];
      if (!container) continue;
      result[containerNames[i]] = parseMapContainer(container);
    }
    return result;
  }

  private async loadContainer(name: string, storageID: MapStorageID): Promise<string> {
    const signal = this.abortController.signal;
    const res = await mapAPI.getMapContainer(name, storageID, signal);
    if (res.ok) return res.data;
    ++this.errorCounter;
    return null;
  }
}
