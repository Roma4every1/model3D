import type { Res } from 'shared/lib';
import type { MapInfo } from '../lib/types';
import { Fetcher, fetcher } from 'shared/lib';
import { MapContainerConverter } from './container-converter';


export class MapAPI {
  private readonly api: Fetcher;
  private readonly converter: MapContainerConverter;

  constructor(fetcher: Fetcher) {
    const key = new Uint8Array([
      0xEF, 0x7E, 0xFF, 0x37, 0xBF, 0xFA, 0xF1, 0x37,
      0xBF, 0xFB, 0xC3, 0xCF, 0xBE, 0xFB, 0xAC, 0xFE,
      0xB1, 0x7F, 0xF1, 0xC3, 0xDF, 0xFE, 0xEE, 0xD7,
      0xBF, 0xFF, 0xF8, 0xFA, 0xCD, 0xBF, 0xF5, 0x9F,
    ]);
    this.api = fetcher;
    this.converter = new MapContainerConverter(key);
  }

  /** Запрос на сохранение карты. */
  public saveMap(formID: FormID, mapID: MapID, mapData: any, storage: MapStorageID): Promise<Res> {
    const data = {formId: formID, mapId: mapID, mapData, owner: storage};
    const blob = this.converter.encode(JSON.stringify(data));
    return this.api.post('/saveMap', {blob});
  }

  /** Загрузка общих данных карты. */
  public getMapInfo(mapID: MapID, formID: FormID, signal?: AbortSignal): Promise<Res<MapInfo>> {
    const query = {mapId: mapID, formId: formID};
    return this.api.get('/getMap', {query: query, signal});
  }

  /** Загрузка контейнера карты. */
  public async getMapContainer(name: string, storage: MapStorageID, signal?: AbortSignal): Promise<Res<string>> {
    const query = {owner: storage, containerName: name};
    const res = await this.api.get('/getContainer', {query, then: 'arrayBuffer', signal});
    if (res.ok) res.data = this.converter.decode(res.data);
    return res;
  }
}

export const mapAPI = new MapAPI(fetcher);
