import { def2json } from './symbols';
import { parseDef } from './symbol2svg';
import symbolDef from 'assets/map-libs/symbol.def';


type SignImageGetter = (color: ColorString) => string;
type SignImageLibrary = Record<string, Map<number, SignImageGetter>>;

export interface SignFontData {
  id: string;
  name: string;
  minIndex: number;
  maxIndex: number;
}

export class MapSignProvider {
  public readonly fontData: SignFontData[] = [];
  public readonly defaultLib = 'PNT.CHR';
  public readonly defaultColor = '#000000';
  public defaultImage: HTMLImageElement;

  private initialized: boolean = false;
  private libs: SignImageLibrary = {};
  private readonly cache: Record<string, Promise<HTMLImageElement>> = {};

  public getImage(lib: string, index: number, color: string): Promise<HTMLImageElement> {
    const hash = lib + index + color;
    if (this.cache[hash]) return this.cache[hash];

    let getter = this.libs[lib.toUpperCase()]?.get(index);
    if (!getter) getter = this.libs[this.defaultLib].get(0);
    const imageData = loadImageData(getter(color));

    this.cache[hash] = imageData;
    return imageData;
  }

  public getFontData(id: string): SignFontData {
    const data = this.fontData.find(d => d.id === id);
    return data ?? {id: '', name: 'unknown', minIndex: 0, maxIndex: 0};
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      const data = await fetch(symbolDef).then(r => r.arrayBuffer());
      this.libs = parseDef(def2json(new TextDecoder('cp1251').decode(data)));
    } catch {
      this.libs = {}; // handler below
    }

    const libIDs = Object.keys(this.libs);
    if (libIDs.length === 0 || !libIDs.includes(this.defaultLib)) {
      const map = new Map<number, SignImageGetter>();
      map.set(0, () => '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
      this.libs[this.defaultLib] = map;
      libIDs.push(this.defaultLib);
    }

    for (const id of libIDs) {
      let minIndex = Infinity, maxIndex = -Infinity;
      for (const index of this.libs[id].keys()) {
        if (index < minIndex) minIndex = index;
        if (index > maxIndex) maxIndex = index;
      }
      const name = `${id} ${minIndex} - ${maxIndex}`;
      this.fontData.push({id, name, minIndex, maxIndex});
    }

    this.defaultImage = await this.getImage(this.defaultLib, 0, this.defaultColor);
    this.initialized = true;
  }
}

function loadImageData(data: string): Promise<HTMLImageElement> {
  const blob = new Blob([data], {type: 'image/svg+xml'});
  const url = URL.createObjectURL(blob);

  const img = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = () => resolve(image);
    image.onerror = reject;
  });

  img.finally(() => URL.revokeObjectURL(url));
  return img;
}

export const signProvider = new MapSignProvider();
