import parseColor from 'parse-color';
import parseSMB from '../../map/drawer/parse-smb';

import dro32Lib from 'assets/map-libs/dro32.smb';
import gridsLib from 'assets/map-libs/grids.smb';
import litLib from 'assets/map-libs/lit.smb';
import regionalLib from 'assets/map-libs/regional.smb';


export class FillPatternsManager {
  public ready: boolean;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly libs: Record<string, number[][][]>;

  constructor() {
    const canvas = document.createElement('canvas');
    this.ctx = canvas.getContext('2d');
    this.libs = {};
    this.ready = false;
  }

  public async initialize(): Promise<boolean> {
    if (this.ready) return;
    const results = await Promise.all([
      this.fetchLib('dro32_', dro32Lib),
      this.fetchLib('grids', gridsLib),
      this.fetchLib('lit', litLib),
      this.fetchLib('regional', regionalLib)
    ]);
    this.ready = true;
    return results[0] && results[1] && results[2] && results[3];
  }

  private async fetchLib(type: string, path: string): Promise<boolean> {
    try {
      const init: RequestInit = {credentials: 'include'};
      const buffer = await fetch(path, init).then((res) => res.arrayBuffer());
      this.libs[type] = parseSMB(new Uint8Array(buffer));
      return true;
    }
    catch {
      return false;
    }
  }

  public createPattern(name: string, color: ColorHEX, background: ColorHEX) {
    try {
      let [, libName, index] = name.match(/^(.+)-(\d+)$/);
      const lib = this.libs[libName.toLowerCase()];
      if (!lib) return background;

      const img = this.createImage(lib[index], color, background);
      return this.ctx.createPattern(img, 'repeat');
    }
    catch {
      return background;
    }
  }

  private createImage(matrix: number[][], color: ColorHEX, background: ColorHEX) {
    let [red, green, blue, alpha] = parseColor(color).rgba;
    let [backRed, backGreen, backBlue, backAlpha] = parseColor(background).rgba;
    alpha = Math.round(alpha * 255);
    backAlpha = Math.round(backAlpha * 255);

    const canvas = document.createElement('canvas');
    const size = 32;
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(size, size);
    const buffer = imageData.data;

    for(let y = 0; y < size; y++) {
      for(let x = 0; x < size; x++) {
        const pos = (y * size + x) * 4;
        if (matrix[y][x]) {
          buffer[pos    ] = red;
          buffer[pos + 1] = green;
          buffer[pos + 2] = blue;
          buffer[pos + 3] = alpha;
        } else {
          buffer[pos    ] = backRed;
          buffer[pos + 1] = backGreen;
          buffer[pos + 2] = backBlue;
          buffer[pos + 3] = backAlpha;
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }
}

export const patternManager = new FillPatternsManager();
