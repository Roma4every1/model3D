import { CaratDrawerConfig } from './drawer-settings';
import { CaratElementCurve, CaratElementInterval } from '../lib/types';
import { CaratTrackBodyDrawSettings, CaratTrackHeaderDrawSettings } from './drawer-settings';
import { CaratColumnLabelDrawSettings, CaratColumnYAxisDrawSettings } from './drawer-settings';
import { createTrackBodyDrawSettings, createTrackHeaderDrawSettings } from './drawer-settings';
import { createColumnLabelDrawSettings, createColumnYAxisDrawSettings } from './drawer-settings';


interface ICaratDrawer {
  setContext(context: CanvasRenderingContext2D): void
  setCurrentTrack(rect: BoundingRect, viewport: CaratViewport): void
  setCurrentGroup(rect: BoundingRect): void

  clearCurrentTrack(): void
  drawTrackBody(well: string): void
  drawColumnGroupBody(settings: CaratColumnSettings): void
  drawColumnGroupYAxis(axis: CaratColumnYAxis): void

  drawCurves(elements: CaratElementCurve[]): void
  drawIntervals(elements: CaratElementInterval[]): void
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

  private viewport: CaratViewport;
  private trackRect: BoundingRect;
  private groupElementRect: BoundingRect;
  private columnRect: BoundingRect;

  private columnTranslateX: number;
  private columnTranslateY: number;

  constructor(config: CaratDrawerConfig) {
    this.trackBodySettings = createTrackBodyDrawSettings(config);
    this.trackHeaderSettings = createTrackHeaderDrawSettings(config);
    this.columnLabelSettings = createColumnLabelDrawSettings(config);
    this.columnYAxisSettings = createColumnYAxisDrawSettings(config);
  }

  public setContext(context: CanvasRenderingContext2D) {
    this.ctx = context;
    this.ctx.font = this.columnYAxisSettings.font;
    this.minusWidth = context.measureText('-').width;
    window['ctx'] = context;
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

  /* --- Transforms --- */

  private setTranslate(x: number, y: number) {
    const ratio = CaratDrawer.ratio;
    this.ctx.setTransform(ratio, 0, 0, ratio, ratio * x, ratio * y);
  }

  /* --- Rendering --- */

  public setCurrentTrack(rect: BoundingRect, viewport: CaratViewport) {
    this.trackRect = rect;
    this.viewport = viewport;
  }

  public setCurrentGroup(rect: BoundingRect) {
    this.groupElementRect = rect;
  }

  public setCurrentColumn(rect: BoundingRect) {
    this.columnRect = rect;
    this.columnTranslateX = this.trackRect.left + this.groupElementRect.left + rect.left;
    this.columnTranslateY = this.trackRect.top + this.groupElementRect.top + rect.top;
  }

  public clearCurrentTrack() {
    const { top, left, width, height } = this.trackRect;
    this.setTranslate(left, top);
    this.ctx.clearRect(0, 0, width, height);
  }

  public drawTrackBody(well: string) {
    const { top, left, width, height: trackHeight } = this.trackRect;
    const { font, color, borderColor, borderThickness, height } = this.trackHeaderSettings;
    const { borderColor: bodyColor, borderThickness: bodyThickness, margin } = this.trackBodySettings;
    this.setTranslate(left, top);

    this.setTextSettings(font, color, 'center', 'middle');
    this.ctx.fillText(well, width / 2, height / 2);

    this.setLineSettings(borderThickness, borderColor);
    this.ctx.strokeRect(0, 0, width, height);

    this.setLineSettings(bodyThickness, bodyColor);
    this.ctx.clearRect(-margin, trackHeight, width + 2 * margin, margin);
    this.ctx.strokeRect(0, 0, width, trackHeight);
  }

  public drawColumnGroupBody(settings: CaratColumnSettings) {
    const translateX = this.trackRect.left + this.groupElementRect.left;
    const translateY = this.trackRect.top + this.groupElementRect.top;
    this.setTranslate(translateX, translateY);

    const { width, height } = this.groupElementRect;
    const { font, color } = this.columnLabelSettings;
    this.ctx.clearRect(0, -translateY, width, translateY);

    this.setTextSettings(font, color, 'center', 'bottom');
    this.ctx.fillText(settings.label, width / 2, 0, width);

    this.setLineSettings(1, settings.borderColor);
    this.ctx.strokeRect(0, 0, width, height);
  }

  public drawColumnGroupYAxis(axis: CaratColumnYAxis) {
    const { y: viewportY, scale } = this.viewport;
    const scaleY = window.devicePixelRatio * scale;

    this.setTranslate(
      this.trackRect.left + this.groupElementRect.left,
      this.trackRect.top + this.groupElementRect.top - scaleY * viewportY,
    );

    const step = axis.step;
    const minY = Math.ceil(viewportY / step) * step;
    const maxY = minY + this.groupElementRect.height / scale;

    const { font, color, markSize } = this.columnYAxisSettings;
    const drawMarksFn = this.getDrawMarksFn(axis, 1.1 * markSize);

    this.setLineSettings(2, '#303030');
    this.setTextSettings(font, color, 'left', 'middle');
    this.ctx.beginPath();

    for (let y = minY; y < maxY; y += step) {
      const canvasY = y * scaleY;
      this.ctx.moveTo(0, canvasY);
      this.ctx.lineTo(markSize, canvasY);
      drawMarksFn(y, canvasY);
    }
    this.ctx.stroke();
  }

  public drawIntervals(elements: CaratElementInterval[]) {
    const { y, scale } = this.viewport;
    const scaleY = window.devicePixelRatio * scale;
    this.setTranslate(this.columnTranslateX, this.columnTranslateY - scaleY * y);

    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'black';
    this.ctx.fillStyle = 'orange';
    const width = this.columnRect.width;
    const maxY = y + this.groupElementRect.height / scale;

    for (let { top, base } of elements) {
      if (base < y || top > maxY) continue;
      const canvasTop = scaleY * top;
      const height = scaleY * (base - top);
      this.ctx.fillRect(0, canvasTop, width, height);
      this.ctx.strokeRect(0, canvasTop, width, height);
    }
  }

  public drawCurves(elements: CaratElementCurve[]) {
    const ratio = CaratDrawer.ratio;
    const { y: viewportY, scale } = this.viewport;
    const scaleY = window.devicePixelRatio * scale;

    const translateX = ratio * this.columnTranslateX;
    const translateY = ratio * (this.columnTranslateY - scaleY * viewportY);
    const matrix = new DOMMatrix([ratio, 0, 0, scaleY * ratio, translateX, translateY]);

    this.ctx.resetTransform();
    this.setLineSettings(ratio * 2, 'black');

    for (const element of elements) {
      const path = new Path2D();
      path.addPath(element.path, matrix)
      this.ctx.stroke(path);
    }
  }
}
