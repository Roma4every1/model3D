import { inflate, deflate } from "pako";
import { readXml } from "../components/forms/map/drawer/gs-transform";
import { types } from "../components/forms/map/drawer/map-drawer";


/* --- Map Data --- */

/** Заглушка серверной ошибки со строковым значением масштабов. */
export function handleLayerScales(rawLayer: MapLayerRaw): void {
  if (typeof rawLayer.lowscale === 'string' && rawLayer.lowscale !== 'INF')
    rawLayer.lowscale = parseInt(rawLayer.lowscale);
  if (typeof rawLayer.highscale === 'string' && rawLayer.highscale !== 'INF')
    rawLayer.highscale = parseInt(rawLayer.highscale);
}

/** Проверка индекса контейнера. */
export function checkLayerIndex(mapData: MapDataRaw, layer: MapLayerRaw) {
  let indexName = null;
  if (!mapData.indexes || !mapData.indexes.length) return indexName;

  const indexes = [];
  const indexesForContainer = mapData.indexes.find((i) => i.container === layer.container);

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

/** Задание изображений для элементов (для `sign`, `polyline` и `field`). */
export async function loadLayerElements(elements: MapElement[], provider: any) {
  for (const element of elements) {
    const t = types[element.type];
    if (t && t.loaded) await t.loaded(element, provider);
  }
}

/* --- Map Containers --- */

export class MapContainerConverter {
  private readonly key: Uint8Array;

  constructor(key: number[]) {
    this.key = new Uint8Array(key);
  }

  /** XOR-шифрование (симметричное).
   * @see https://en.wikipedia.org/wiki/XOR_cipher
   * */
  public cipherXOR(arr: Uint8Array): Uint8Array {
    const ciphered = new Uint8Array(arr.length);
    const key = this.key, len = this.key.length;
    arr.forEach((byte, index) => { ciphered[index] = byte ^ key[index % len]; });
    return ciphered;
  }

  /** Кодирует строку в массив байт, проводя следующие преобразования:
   * 1. UTF-8 string -> Uint8Array (байты)
   * 2. compress (zlib.deflate)
   * 3. XOR-cipher
   * */
  public encode(reqBodyString: string): ArrayBuffer {
    const encrypted = deflate(reqBodyString);
    return this.cipherXOR(encrypted).buffer;
  }

  /** Декодирует массив байт в строку, проводя следующие преобразования:
   * 1. XOR-cipher
   * 2. decompress (zlib.inflate)
   * 3. Uint8Array (байты) -> UTF-8 string
   * */
  public decode(containerArrayBuffer: ArrayBuffer): string {
    const decrypted = this.cipherXOR(new Uint8Array(containerArrayBuffer));
    try {
      return inflate(decrypted, {to: 'string'});
    } catch {
      return null;
    }
  }

  public parseContainerXML(containerXML: string): ParsedContainer | string {
    try {
      const data: ParsedContainer = readXml(containerXML);
      if (data && data.layers) {
        Object.values(data.layers).forEach(layer => {layer.elements = layer.elements.map(mapElements)});
      }
      return data;
    } catch (error) {
      return `XML parsing error (${(error as Error).message})`;
    }
  }

  /** Обработка контейнера карты. */
  public parse(container): ParsedContainer | string {
    const containerXML = this.decode(container);
    if (!containerXML) return 'Decompress error';
    return this.parseContainerXML(containerXML);
  }

}

function mapElements(el: any) {
  return {...el, bounds: (el.bounds && el.bounds.length === 1) ? el.bounds[0] : el.bounds};
}

const keyBytes = [
  0xEF, 0x7E, 0xFF, 0x37, 0xBF, 0xFA, 0xF1, 0x37, 0xBF, 0xFB, 0xC3, 0xCF, 0xBE, 0xFB, 0xAC, 0xFE,
  0xB1, 0x7F, 0xF1, 0xC3, 0xDF, 0xFE, 0xEE, 0xD7, 0xBF, 0xFF, 0xF8, 0xFA, 0xCD, 0xBF, 0xF5, 0x9F,
];

export const converter = new MapContainerConverter(keyBytes);
