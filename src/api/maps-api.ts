import { Requester } from "./api";
import symbolDef from "../static/libs/symbol.def";
import { readXml } from "../components/forms/Map/drawer/gsTransform";
import { types } from "../components/forms/Map/drawer/mapDrawer";


function mapElements(el: any) {
  return {...el, bounds: (el.bounds && el.bounds.length === 1) ? el.bounds[0] : el.bounds};
}
function parseMapContainer(containerXML: string): ParsedContainer {
  const data: ParsedContainer = readXml(containerXML);
  Object.values(data.layers).forEach(layer => {layer.elements = layer.elements.map(mapElements)});
  return data;
}


export class MapsAPI {
  private readonly requester: Requester;
  public root: string;

  constructor(requester: Requester) {
    this.requester = requester;
    this.root = '/';
  }

  private async request<Expected>(req: WRequest) {
    return this.requester.request<Expected>(req);
  }

  /** Загрузка файла с описаниями построения точечных элементов. */
  public async getSymbolsLib() {
    const response = await fetch(symbolDef, {credentials: 'include'});
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }

  /** Загрузка файлов с описаниями паттернов линий для отрисовки карт. */
  public async getPatternLib(libName: string) {
    const path = this.root + 'libs/' + libName.toLowerCase() + '.smb';
    const response = await fetch(path, {credentials: 'include'});
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }

  /** Загрузка общих данных карты. */
  public async getMap(sessionId: SessionID, formId: FormID, mapId: MapID) {
    const query = {sessionId, formId, mapId};
    return await this.request<MapDataRaw>({path: 'getMap', query});
  }

  /** Загрузка контейнера карты. */
  public async getMapContainer(containerName: string, sessionId: SessionID, formId: FormID, owner: MapOwner, index?: string) {
    const query = {sessionId, formId, owner, containerName, index};
    const containerXML = await this.request<string>({path: 'getContainer', query});
    return parseMapContainer(containerXML);
  }

  /** Загрузка карты. */
  public async loadMap(provider, sessionId: SessionID, formId: FormID, mapId: MapID, owner = 'Common'): Promise<any | string> {
    const mapData = await this.getMap(sessionId, formId, mapId);
    if (typeof mapData === 'string') return mapData;

    mapData.mapErrors = [];
    const context = {center: {x: 0, y: 0}, scale: 10000};

    try {
      const data = await this.getMapContainer(mapData.namedpoints, sessionId, formId, owner);
      mapData.points = data.namedpoints;
    } catch (error) {
      const message = 'error loading named points from ';
      mapData.mapErrors.push(message + mapData.namedpoints + ', ' + error);
      mapData.points = [];
    }

    for (const rawLayer of mapData.layers) {
      // заглушка серверной ошибки со строковым значением масштабов
      if (typeof rawLayer.lowscale === 'string' && rawLayer.lowscale !== 'INF')
        rawLayer.lowscale = parseInt(rawLayer.lowscale);
      if (typeof rawLayer.highscale === 'string' && rawLayer.highscale !== 'INF')
        rawLayer.highscale = parseInt(rawLayer.highscale);

      const layer: Partial<MapLayer> = {...rawLayer as Partial<MapLayer>};
      let elements: MapElement[] = [];

      try {
        let indexName = null;

        if (mapData.indexes) {
          const indexes = [];
          const indexesForContainer = mapData.indexes.find((i) => i.container === layer.container);

          if (indexesForContainer) {
            indexesForContainer.data.forEach((idx) => {
              if (
                idx.maxx >= context.center.x && idx.minx < context.center.x &&
                idx.maxy >= context.center.y && idx.miny < context.center.y
              ) indexes.push(idx);
            });

            let scaleDif = 0;
            indexes.forEach((idx) => {
              const diff = idx.scale - context.scale + 1;
              if (scaleDif <= 0 || (diff < scaleDif && diff > 0)) {
                scaleDif = diff;
                indexName = idx.hash;
              }
            });

            if (!indexName) {
              if (indexesForContainer.data.length > 0) indexName = indexesForContainer.data[0].hash;
            }
          }

          if (indexName) {
            layer.index = indexName;
          }
        }

        const data = await this.getMapContainer(layer.container, sessionId, formId, owner, indexName);
        const layerFromContainer = layer.uid.includes(layer.container)
          ? data.layers[layer.uid.replace(layer.container, '')]
          : data.layers[layer.uid];

        elements = layerFromContainer.elements;
        layer.version = layerFromContainer.version;

        if (elements.length === 0) {
          // try to find elements among of [layer name] layer into container
          const nameFromContainerInBrackets = "[" + layerFromContainer.name + "]";
          const newLayer = Object.values<any>(data.layers).find(function (l) {
            return l.name === nameFromContainerInBrackets
          });
          if (newLayer != null) {
            elements = newLayer.elements;
          }
        }

        for (const element of elements) {
          if (['sign', 'field', 'polyline'].includes(element.type)) {
            const type: SignType | FieldType | PolylineType = types[element.type];
            await type.loaded(element, provider) //TODO: *provider*
          }
        }

      } finally {
        layer.elements = elements;
      }
    }

    return mapData;
  }
}
