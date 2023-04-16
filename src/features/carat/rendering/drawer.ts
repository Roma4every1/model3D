import { CaratDrawerSettings, CaratElement, CaratElementType } from '../lib/types';


export interface ICaratDrawer {
  resize(): void
  setCanvas(canvas: HTMLCanvasElement): void

  drawTrackHeader(well: string): void
  drawColumnHeader(name: string, axes: any[]): void
  drawColumnAxis(): void

  drawElement(element: CaratElement): void
}


/** Отрисовщик каротажной диаграммы. */
export class CaratDrawer implements ICaratDrawer {
  /** Количество пикселей в метре: `96px = 2.54cm`. */
  public static readonly pixelPerMeter = 100 * 96 / 2.54;
  /** Коэффициент уплотнения DPI для улучшения чёткости изображения. */
  public static readonly ratio = 2;

  /** Настройки отрисовки. */
  private readonly drawSettings: CaratDrawerSettings;

  /** Ссылка на элемент холста. */
  private canvas: HTMLCanvasElement;
  /** Контекст отрисовки. */
  private ctx: CanvasRenderingContext2D;
  /** Ширина области отрисовки. */
  private width: number;
  /** Высота области отрисовки. */
  private height: number;

  public currentTop: number;
  public currentLeft: number;
  public currentWidth: number;

  constructor(settings: CaratDrawerSettings) {
    this.drawSettings = settings;
    this.currentTop = 0;
    this.currentLeft = 0;
    this.currentWidth = 0;
  }

  public resize() {
    const width = this.canvas.clientWidth * CaratDrawer.ratio * window.devicePixelRatio;
    const height = this.canvas.clientHeight * CaratDrawer.ratio * window.devicePixelRatio;

    if (this.canvas.width !== width) {
      this.canvas.width = width;
      this.width = width;
    }
    if (this.canvas.height !== height) {
      this.canvas.height = height;
      this.height = height;
    }
  }

  public setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  private setLineSettings(width: number, color: string) {
    this.ctx.lineWidth = width;
    this.ctx.strokeStyle = color;
  }

  private setTextSettings(font: string, color: string, align?: CanvasTextAlign, baseline?: CanvasTextBaseline) {
    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align ?? 'left';
    this.ctx.textBaseline = baseline ?? 'bottom';
  }

  public drawTrackHeader(well: string) {
    const { font, color } = this.drawSettings.header;
    this.setTextSettings(font, color, 'center');
    this.ctx.fillText(well, this.width / 2, 60);
    this.setLineSettings(1, '#363636');
    this.ctx.strokeRect(6, 6, this.width - 12, 55);
  }

  public drawColumnHeader(name: string, axes: any[]) {
    const { font, color, align } = this.drawSettings.columnLabels;
    this.setTextSettings(font, color, align);

    const width = this.currentWidth * CaratDrawer.ratio * window.devicePixelRatio;
    const x = this.currentLeft + width / 2;
    this.ctx.fillText(name, x, 105, width);
  }

  public drawColumnAxis() {

  }

  public drawElement(element: CaratElement) {
    switch (element.type) {

      case CaratElementType.Interval: {
        this.ctx.lineWidth = 2 * CaratDrawer.ratio;
        this.ctx.strokeStyle = element.style.borderColor;
        this.ctx.fillStyle = element.style.backgroundColor;

        const intervalY = 115 + CaratDrawer.ratio * (element.top - this.currentTop);
        const height = CaratDrawer.ratio * (element.base - element.top);
        this.ctx.fillRect(this.currentLeft, intervalY, this.currentWidth, height);
        this.ctx.strokeRect(this.currentLeft, intervalY, this.currentWidth, height);
        break;
      }

      case CaratElementType.Text: {
        this.ctx.fillStyle = element.style.color;
        this.ctx.fillText(element.text, this.currentLeft, this.currentTop);
        // add background
        break;
      }

      default: {}
    }
  }
}
