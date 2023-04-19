import { CaratElement, CaratElementType } from '../lib/types';
import { CaratDrawerConfig } from './drawer-settings';
import { CaratTrackBodyDrawSettings, CaratTrackHeaderDrawSettings } from './drawer-settings';
import { CaratColumnLabelDrawSettings, CaratColumnYAxisDrawSettings } from './drawer-settings';
import { createTrackBodyDrawSettings, createTrackHeaderDrawSettings } from './drawer-settings';
import { createColumnLabelDrawSettings, createColumnYAxisDrawSettings } from './drawer-settings';


interface ICaratDrawer {
  setContext(context: CanvasRenderingContext2D): void

  drawTrackBody(rect: BoundingRect, well: string): void
  drawColumnHeader(name: string, axes: any[]): void
  drawColumnAxis(): void
  drawElement(element: CaratElement): void
}

/** Отрисовщик каротажной диаграммы. */
export class CaratDrawer implements ICaratDrawer {
  /** Контекст отрисовки. */
  private ctx: CanvasRenderingContext2D;

  /** Настройки отрисовки тела трека. */
  public readonly trackBodySettings: CaratTrackBodyDrawSettings;
  /** Настройки отрисовки шапки трека. */
  public readonly trackHeaderSettings: CaratTrackHeaderDrawSettings;
  /** Настройки отрисовки колонки. */
  public readonly columnLabelSettings: CaratColumnLabelDrawSettings;
  /** Настройки отрисовки колонки. */
  public readonly columnYAxisSettings: CaratColumnYAxisDrawSettings;

  public currentTop: number;
  public currentLeft: number;
  public currentWidth: number;

  constructor(config: CaratDrawerConfig) {
    this.trackBodySettings = createTrackBodyDrawSettings(config);
    this.trackHeaderSettings = createTrackHeaderDrawSettings(config);
    this.columnLabelSettings = createColumnLabelDrawSettings(config);
    this.columnYAxisSettings = createColumnYAxisDrawSettings(config);

    this.currentTop = 0;
    this.currentLeft = 0;
    this.currentWidth = 0;
  }

  public setContext(context: CanvasRenderingContext2D) {
    this.ctx = context;
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

  /* --- Rendering --- */

  public drawTrackBody(rect: BoundingRect, well: string) {
    const { top, left, width } = rect;
    const { borderColor: bodyColor, borderThickness: bodyThickness } = this.trackBodySettings;
    const { font, color, borderColor, borderThickness, height, padding } = this.trackHeaderSettings;

    this.setTextSettings(font, color, 'center', 'top');
    this.ctx.fillText(well, width / 2, top + padding);

    this.setLineSettings(borderThickness, borderColor);
    this.ctx.strokeRect(left, top, width, height);
    this.setLineSettings(bodyThickness, bodyColor);
    this.ctx.strokeRect(left, top, width, rect.height);
  }

  public drawColumnHeader(name: string, axes: any[]) {
    const { font, color, align } = this.columnLabelSettings;
    this.setTextSettings(font, color, align);

    const width = this.currentWidth;
    this.ctx.fillText(name, this.currentLeft + width , 105, width);
  }

  public drawColumnAxis() {

  }

  public drawElement(element: CaratElement) {
    switch (element.type) {

      case CaratElementType.Interval: {
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = element.style.borderColor;
        this.ctx.fillStyle = element.style.backgroundColor;

        const intervalY = 115 + (element.top - this.currentTop);
        const height = element.base - element.top;
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
