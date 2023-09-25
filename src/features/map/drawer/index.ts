import { def2json } from './symbols';
import { parseDef } from './symbol2svg';
import { mapsAPI } from '../lib/maps.api';


type SignImageGetter = (color: ColorHEX) => string;
type SignImageLibrary = Record<string, Map<number, SignImageGetter>>;

export interface SignFontData {
  id: string;
  name: string;
  minIndex: number;
  maxIndex: number;
}


class MapProvider {
  private static readonly UnknownFontData: SignFontData = {
    id: '', name: 'unknown',
    minIndex: 0, maxIndex: 0
  };

  public defaultSignLib = 'PNT.CHR';
  public defaultSignColor = '#000000';
  public defaultSignImage: HTMLImageElement;
  public readonly fontData: SignFontData[] = [];

  private initialized: boolean = false;
  private lib: SignImageLibrary = {};
  private readonly cache: Record<string, Promise<HTMLImageElement>> = {};

  public getSignImage(fontID: string, index: number, color: string): Promise<HTMLImageElement> {
    const hash = fontID + index + color;
    if (this.cache[hash]) return this.cache[hash];

    let getter = this.lib[fontID.toUpperCase()]?.get(index);
    if (!getter) getter = this.lib[this.defaultSignLib].get(0);
    const imageData = loadImageData(getter(color));

    this.cache[hash] = imageData;
    return imageData;
  }

  public getSignFontData(id: string): SignFontData {
    return this.fontData.find(d => d.id === id) ?? MapProvider.UnknownFontData;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      const data = await mapsAPI.getSymbolsLib();
      this.lib = parseDef(def2json(new TextDecoder('cp1251').decode(data)));
    } catch {
      this.lib = {}; // handler below
    }

    const libIDs = Object.keys(this.lib);
    if (libIDs.length === 0 || !libIDs.includes(this.defaultSignLib)) {
      const map = new Map<number, SignImageGetter>();
      map.set(0, () => '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
      this.lib[this.defaultSignLib] = map;
      libIDs.push(this.defaultSignLib);
    }

    for (const id of libIDs) {
      let minIndex = Infinity, maxIndex = -Infinity;
      for (const index of this.lib[id].keys()) {
        if (index < minIndex) minIndex = index;
        if (index > maxIndex) maxIndex = index;
      }
      const name = `${id} ${minIndex} - ${maxIndex}`;
      this.fontData.push({id, name, minIndex, maxIndex});
    }

    this.defaultSignImage = await this.getSignImage(this.defaultSignLib, 0, this.defaultSignColor);
    this.initialized = true;
  }
}

function loadImageData(data: string): Promise<HTMLImageElement> {
  const blob = new Blob([data], {type: 'image/svg+xml'});
  const url = URL.createObjectURL(blob);

  const img = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = () => { resolve(image); };
    image.onerror = reject;
  });

  const fin = () => { URL.revokeObjectURL(url); };
  img.then(fin).catch(fin);
  return img;
}

export const provider = new MapProvider();
