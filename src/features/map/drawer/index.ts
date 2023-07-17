import lines from './lines.json';
import { def2json } from './symbols';
import { parseDef } from './symbol2svg';
import { loadImageData } from './html-helper';
import { mapsAPI } from '../lib/maps.api';


class MapProvider {
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

  private initialized: boolean = false;
  private lib: any = null;
  private cache: Record<string, Promise<HTMLImageElement>> = {};

  public getSignImage(name: string, index: number | string, color: string): Promise<HTMLImageElement> {
    const hash = name + index + color;
    if (this.cache[hash]) return this.cache[hash];

    const template = this.lib[`${name.toUpperCase()} (${index})`] || this.lib['PNT.CHR (0)'];
    const imageData = loadImageData(template(color), 'image/svg+xml');

    this.cache[hash] = imageData;
    return imageData;
  }

  public async initialize() {
    if (this.initialized) return;
    const data = await mapsAPI.getSymbolsLib();
    this.lib = parseDef(def2json(new TextDecoder('cp1251').decode(data)));
  }
}

export const provider = new MapProvider();
