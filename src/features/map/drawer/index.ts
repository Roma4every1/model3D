import lines from './lines.json';
import { def2json } from './symbols';
import { parseDef } from './symbol2svg';
import { loadImageData } from './html-helper';
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
  private static UnknownFontData: SignFontData = {
    id: '', name: 'unknown',
    minIndex: 0, maxIndex: 0
  };
  private static defaultSignLib = 'PNT.CHR';

  public drawOptions = {
    zoomSleep: 400,
    selectedSize: 6,
    selectedColor: '#000FFF',
    selectedWidth: 1,
    piesliceBorderColor: 'black',
    piesliceBorderWidth: 0.2,
    piesliceAlpha: 0.7,
  };

  public lineConfig = lines;
  public fontData: SignFontData[] = [];

  private initialized: boolean = false;
  private lib: SignImageLibrary = {};
  private cache: Record<string, Promise<HTMLImageElement>> = {};

  public getSignImage(fontID: string, index: number, color: string): Promise<HTMLImageElement> {
    const hash = fontID + index + color;
    if (this.cache[hash]) return this.cache[hash];

    let getter = this.lib[fontID.toUpperCase()]?.get(index);
    if (!getter) getter = this.lib[MapProvider.defaultSignLib].get(0);
    const imageData = loadImageData(getter(color), 'image/svg+xml');

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
    if (libIDs.length === 0 || !libIDs.includes(MapProvider.defaultSignLib)) {
      const map = new Map<number, SignImageGetter>();
      map.set(0, () => '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
      this.lib[MapProvider.defaultSignLib] = map;
      libIDs.push(MapProvider.defaultSignLib);
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
  }
}

export const provider = new MapProvider();
