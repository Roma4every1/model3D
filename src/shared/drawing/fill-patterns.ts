import parseColor from 'parse-color';
import dro32Lib from 'assets/map-libs/dro32.bin';
import gridsLib from 'assets/map-libs/grids.bin';
import litLib from 'assets/map-libs/lit.bin';
import regionalLib from 'assets/map-libs/regional.bin';


interface IFillPatterns {
  initialize(): Promise<void>
  createFillStyle(name: string, color: ColorString, background: ColorString): CanvasPattern | string;
}


/** Класс для реализации библиотек заливок. */
export class FillPatterns implements IFillPatterns {

  /**
   * Байты с которых должен начинаться файл библиотеки заливок:
   *
   * `"Element 1.0\r\n\x1A\x20\x00\x20\x00\x00"`
   * */
  private static readonly firstBytes = [
    69, 108, 101, 109, 101, 110, 116, 32, 49, 46,
    48, 13, 10, 26, 32, 0, 32, 0, 0
  ];
  /** Размер изображения, по которому создаётся паттерн. */
  private static readonly imageSize = 32;

  /** Флаг, показывающий, вызывался ли метод инициализации. */
  public initialized: boolean;
  /** Список доступных заливкок. */
  public readonly allPatterns: string[];
  /** Словарь библиотек заливок. */
  private readonly libs: Record<string, Matrix[]>;

  /** Холст для создания паттерна. */
  private readonly canvas: HTMLCanvasElement;
  /** Контекст отрисовки. */
  private readonly context: CanvasRenderingContext2D;
  /** Буфер, хранящий цвета пикселей. */
  private readonly imageData: ImageData;

  constructor() {
    this.allPatterns = [
      '', 'halftone-0', 'halftone-8', 'halftone-16', 'halftone-24',
      'halftone-32', 'halftone-40', 'halftone-48', 'halftone-56', 'halftone-64',
    ];
    this.libs = {};
    this.initialized = false;

    const size = FillPatterns.imageSize;
    this.canvas = document.createElement('canvas');
    this.canvas.width = size;
    this.canvas.height = size;

    this.context = this.canvas.getContext('2d');
    this.imageData = this.context.createImageData(size, size);
  }

  /** Загружает библиотеки заливок. */
  public async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    await Promise.all([
      this.fetchLib('dro32_', dro32Lib),
      this.fetchLib('grids', gridsLib),
      this.fetchLib('lit', litLib),
      this.fetchLib('regional', regionalLib)
    ]);

    for (const type of ['grids', 'lit', 'regional']) {
      for (let i = 0; i < this.libs[type].length; i++) {
        this.allPatterns.push(type + '-' + i);
      }
    }
  }

  /** Создаёт паттерн заливки по типу и двум цветам. */
  public createFillStyle(name: string, color: ColorString, background: ColorString): CanvasPattern | string {
    if (!background || background === 'none') background = 'rgba(0,0,0,0)';
    if (!name) return background;

    try {
      let [, libName, index] = name.match(/^(.+)-(\d+)$/);
      libName = libName.toLowerCase();

      if (libName === 'halftone') {
        const c = parseColor(color).rgb;
        const b = parseColor(background).rgb;
        const t = parseInt(index) / 64;
        return `rgb(${b.map((bi, i) => Math.round(bi + (c[i] - bi) * t))})`;
      }

      const lib = this.libs[libName];
      if (!lib) return background;

      this.fill(lib[index], color, background);
      return this.context.createPattern(this.canvas, 'repeat');
    }
    catch {
      return background;
    }
  }

  /** Заполняет буфер значениями цвета. */
  private fill(matrix: number[][], color: ColorString, background: ColorString) {
    let [red, green, blue, alpha] = parseColor(color).rgba;
    let [backRed, backGreen, backBlue, backAlpha] = parseColor(background).rgba;
    alpha = Math.round(alpha * 255);
    backAlpha = Math.round(backAlpha * 255);

    const size = FillPatterns.imageSize;
    const buffer = this.imageData.data;

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
    this.context.putImageData(this.imageData, 0, 0);
  }

  /** Загружает библиотеку и парсит её как SMB. */
  private async fetchLib(type: string, path: string): Promise<void> {
    try {
      const init: RequestInit = {credentials: 'include'};
      const buffer = await fetch(path, init).then((res) => res.arrayBuffer());
      this.libs[type] = this.parseSMB(new Uint8Array(buffer));
    } catch {
      this.libs[type] = [];
    }
  }

  /** Создаёт набор матриц, задающих паттерн изображения. */
  private parseSMB(data: Uint8Array): Matrix[] {
    const firstBytesLength = FillPatterns.firstBytes.length;
    for (let i = 0; i < firstBytesLength; i++) {
      if (data[i] !== FillPatterns.firstBytes[i]) throw new Error('not a SMB format');
    }

    const lib: Matrix[] = [];
    let index = firstBytesLength;

    while (index < data.length) {
      const matrix: Matrix = [];

      for (let y = 0; y < 32; ++y) {
        matrix[y] = [];

        for (let b = 0; b < 4; ++b) {
          let code = data[index++];

          for (let i = 0; i < 8; ++i) {
            matrix[y][b * 8 + i] = (code & 128) >> 7;
            code <<= 1;
          }
        }
      }
      lib.push(matrix);
    }
    return lib;
  }
}
