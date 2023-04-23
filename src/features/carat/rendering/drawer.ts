import { CaratElementInterval } from '../lib/types';
import { CaratDrawerConfig } from './drawer-settings';
import { CaratTrackBodyDrawSettings, CaratTrackHeaderDrawSettings } from './drawer-settings';
import { CaratColumnLabelDrawSettings, CaratColumnYAxisDrawSettings } from './drawer-settings';
import { createTrackBodyDrawSettings, createTrackHeaderDrawSettings } from './drawer-settings';
import { createColumnLabelDrawSettings, createColumnYAxisDrawSettings } from './drawer-settings';


interface ICaratDrawer {
  setContext(context: CanvasRenderingContext2D): void

  drawTrackBody(rect: BoundingRect, well: string): void
  drawColumnBody(rect: BoundingRect, label: string): void
  drawColumnYAxis(rect: BoundingRect, axis: CaratColumnYAxis, viewport: CaratViewport): void
  drawIntervals(rect: BoundingRect, viewport: CaratViewport, elements: CaratElementInterval[]): void
}

/** Отрисовщик каротажной диаграммы. */
export class CaratDrawer implements ICaratDrawer {
  /** Количество пикселей в метре: `96px = 2.54cm`. */
  public static readonly pixelPerMeter = 100 * 96 / 2.54;
  /** Коэффициент уплотнения DPI для улучшения чёткости изображения. */
  public static readonly ratio = 2;

  /** Пустая функция. */
  private static readonly emptyFn = () => {};
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

  private minusWidth: number;

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
    this.minusWidth = 0;
  }

  public setContext(context: CanvasRenderingContext2D) {
    this.ctx = context;
    this.ctx.font = this.columnYAxisSettings.font;
    this.minusWidth = context.measureText('-').width;
  }

  private setLineSettings(width: number, color: string) {
    this.ctx.lineWidth = width;
    this.ctx.strokeStyle = color;
  }

  private setTextSettings(font: string, color: string, align: CanvasTextAlign, baseline: CanvasTextBaseline) {
    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = baseline
  }

  private getDrawMarksFn(settings: CaratColumnYAxis, textStart: number) {
    const { absMarks, depthMarks } = settings;
    let fn: (y: number, canvasY: number) => void = CaratDrawer.emptyFn;

    if (absMarks && depthMarks) {
      const absMarkStart = textStart + this.minusWidth;
      fn = (y, canvasY) => {
        if (y > 0) {
          this.ctx.textBaseline = 'bottom';
          this.ctx.fillText(y.toString(), absMarkStart, canvasY);
          this.ctx.textBaseline = 'top';
          this.ctx.fillText((-y).toString(), textStart, canvasY);
        } else if (y === 0) {
          this.ctx.fillText('0', textStart, canvasY);
        } else {
          this.ctx.textBaseline = 'bottom';
          this.ctx.fillText(y.toString(), textStart, canvasY);
          this.ctx.textBaseline = 'top';
          this.ctx.fillText((-y).toString(), absMarkStart, canvasY);
        }
      };
    } else if (absMarks) {
      fn = (y, canvasY) => {
        this.ctx.fillText(y.toString(), textStart, canvasY);
      };
    } else if (depthMarks) {
      fn = (y, canvasY) => {
        this.ctx.fillText((-y).toString(), textStart, canvasY);
      };
    }
    return fn;
  }

  /* --- Rendering --- */

  public clear(x: number, y: number, width: number, height: number) {
    this.ctx.clearRect(x, y, width, height);
  }

  public clearBoundingRect(rect: BoundingRect) {
    this.ctx.clearRect(rect.left, rect.top, rect.width, rect.height);
  }

  public drawTrackBody(rect: BoundingRect, well: string) {
    const { top, left, width, bottom } = rect;
    const { font, color, borderColor, borderThickness, height } = this.trackHeaderSettings;
    const { borderColor: bodyColor, borderThickness: bodyThickness, margin } = this.trackBodySettings;

    this.setTextSettings(font, color, 'center', 'middle');
    this.ctx.fillText(well, width / 2, top + height / 2);

    this.setLineSettings(borderThickness, borderColor);
    this.ctx.strokeRect(left, top, width, height);

    this.setLineSettings(bodyThickness, bodyColor);
    this.ctx.clearRect(left - margin, bottom, width + 2 * margin, margin);
    this.ctx.strokeRect(left, top, width, rect.height);
  }

  public drawColumnBody(rect: BoundingRect, label: string) {
    const { top, left, width, height } = rect;
    const { font, color } = this.columnLabelSettings;
    this.ctx.clearRect(left, 0, width, top);

    this.setTextSettings(font, color, 'center', 'bottom');
    this.ctx.fillText(label, left + width / 2, top, width);

    this.setLineSettings(2, color);
    this.ctx.strokeRect(left, top, width, height);
  }

  public drawColumnYAxis(rect: BoundingRect, axis: CaratColumnYAxis, viewport: CaratViewport) {
    const step = axis.step;
    const { top, left } = rect;
    const { y: viewportY, scale } = viewport;
    const { font, color, markSize } = this.columnYAxisSettings;

    const markEnd = left + markSize;
    const textStart = left + 1.1 * markSize;
    const drawMarksFn = this.getDrawMarksFn(axis, textStart);

    const minY = Math.ceil(viewportY / step) * step;
    const maxY = minY + rect.height / scale;

    this.setLineSettings(4, '#303030');
    this.setTextSettings(font, color, 'left', 'middle');
    this.ctx.beginPath();

    for (let y = minY; y < maxY; y += step) {
      const canvasY = top + (y - viewportY) * scale * CaratDrawer.ratio * window.devicePixelRatio;
      this.ctx.moveTo(left, canvasY);
      this.ctx.lineTo(markEnd, canvasY);
      drawMarksFn(y, canvasY);
    }
    this.ctx.stroke();
  }

  public drawIntervals(rect: BoundingRect, viewport: CaratViewport, elements: CaratElementInterval[]) {
    const { y, scale } = viewport;
    const m = CaratDrawer.ratio * window.devicePixelRatio * scale;
    const { top, left, bottom, width } = rect;

    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = 'black';
    this.ctx.fillStyle = 'gray';

    for (const element of elements) {
      let canvasTop = top + (element.top - y) * m;
      if (canvasTop >= bottom) continue;
      let canvasBase = top + (element.base - y) * m;
      if (canvasBase <= top) continue;

      if (canvasTop <= top) canvasTop = top; // TODO: убрать
      const height = canvasBase - canvasTop;
      this.ctx.fillRect(left, canvasTop, width, height);
      this.ctx.strokeRect(left, canvasTop, width, height);
    }
  }
}
