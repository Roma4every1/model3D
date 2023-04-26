import { CaratDrawerConfig } from './drawer-settings';
import { CaratElementCurve, CaratElementInterval, CaratElementBar } from '../lib/types';
import { CaratTrackBodyDrawSettings, CaratTrackHeaderDrawSettings } from './drawer-settings';
import { CaratColumnLabelDrawSettings, CaratColumnYAxisDrawSettings } from './drawer-settings';
import { createTrackBodyDrawSettings, createTrackHeaderDrawSettings } from './drawer-settings';
import { createColumnLabelDrawSettings, createColumnYAxisDrawSettings } from './drawer-settings';


interface ICaratDrawer {
  setContext(context: CanvasRenderingContext2D): void
  setCurrentTrack(rect: BoundingRect, viewport: CaratViewport): void
  setCurrentGroup(rect: BoundingRect): void

  clearCurrentTrack(): void
  drawTrackBody(well: string, headersHeight: number): void
  drawColumnGroupBody(settings: CaratColumnSettings): void
  drawColumnGroupYAxis(axis: CaratColumnYAxis): void

  drawCurves(elements: CaratElementCurve[]): void
  drawIntervals(elements: CaratElementInterval[]): void
  drawBars(elements: CaratElementBar[], settings: CaratBarPropertySettings): void
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

  private trackRect: BoundingRect;
  private groupElementRect: BoundingRect;
  private columnRect: BoundingRect;

  private yMin: number;
  private yMax: number;
  private scale: number;

  private columnTranslateX: number;
  private columnTranslateY: number;

  private minusWidth: number;

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
    this.yMin = viewport.y;
    this.scale = viewport.scale;
  }

  public setCurrentGroup(rect: BoundingRect) {
    this.groupElementRect = rect;
    this.yMax = this.yMin + rect.height / this.scale;
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

  public drawTrackBody(well: string, headersHeight: number) {
    const { top, left, width, height: trackHeight } = this.trackRect;
    const { font, color, borderColor, borderThickness, height } = this.trackHeaderSettings;
    const { borderColor: bodyColor, borderThickness: bodyThickness, margin } = this.trackBodySettings;

    this.setTranslate(left, top);
    this.ctx.clearRect(0, -top, width, top + headersHeight);

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

    this.setTextSettings(font, color, 'center', 'bottom');
    this.ctx.fillText(settings.label, width / 2, 0, width);

    this.setLineSettings(1, settings.borderColor);
    this.ctx.strokeRect(0, 0, width, height);
  }

  public drawColumnGroupYAxis(axis: CaratColumnYAxis) {
    const scaleY = window.devicePixelRatio * this.scale;
    const translateX = this.trackRect.left + this.groupElementRect.left;
    const translateY = this.trackRect.top + this.groupElementRect.top - scaleY * this.yMin;
    this.setTranslate(translateX, translateY);

    const step = axis.step;
    const minY = Math.ceil(this.yMin / step) * step;
    const maxY = minY + this.groupElementRect.height / this.scale;

    const { font, color, markSize } = this.columnYAxisSettings;
    const drawMarksFn = this.getDrawMarksFn(axis, 1.1 * markSize);

    this.setLineSettings(2, color);
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
    const width = this.columnRect.width;
    const scaleY = window.devicePixelRatio * this.scale;
    this.setTranslate(this.columnTranslateX, this.columnTranslateY - scaleY * this.yMin);

    for (let { top, base, style } of elements) {
      if (base < this.yMin || top > this.yMax) continue;
      const canvasTop = scaleY * top;
      const canvasHeight = scaleY * (base - top);

      this.setLineSettings(2, style.borderColor);
      this.ctx.fillStyle = style.backgroundColor;
      this.ctx.fillRect(0, canvasTop, width, canvasHeight);
      this.ctx.strokeRect(0, canvasTop, width, canvasHeight);
    }
  }

  public drawBars(elements: CaratElementBar[], settings: CaratBarPropertySettings) {
    const width = this.columnRect.width;
    const scaleY = window.devicePixelRatio * this.scale;
    this.setTranslate(this.columnTranslateX, this.columnTranslateY - scaleY * this.yMin);

    const charCode = settings.align.charCodeAt(0);
    const { borderColor, backgroundColor, thickness, externalBorderColor, externalThickness } = settings;

    const drawBar = (top, base, barStart, barWidth) => {
      const canvasTop = scaleY * top;
      const canvasHeight = scaleY * (base - top);

      this.setLineSettings(externalThickness, externalBorderColor);
      this.ctx.strokeRect(0, canvasTop, width, canvasHeight);

      this.ctx.fillStyle = backgroundColor;
      this.ctx.fillRect(barStart, canvasTop, barWidth, canvasHeight);

      this.setLineSettings(thickness, borderColor);
      this.ctx.strokeRect(barStart, canvasTop, barWidth, canvasHeight);
    };

    if (charCode === 108) { // 'left'
      for (let { top, base, value } of elements) {
        if (base < this.yMin || top > this.yMax || !value) continue;
        const barWidth = value * width;
        drawBar(top, base, 0, barWidth);
      }
    } else if (charCode === 114) { // 'right'
      for (let { top, base, value } of elements) {
        if (base < this.yMin || top > this.yMax || !value) continue;
        const barWidth = value * width;
        drawBar(top, base, width - barWidth, barWidth);
      }
    } else { // 'center'
      for (let { top, base, value } of elements) {
        if (base < this.yMin || top > this.yMax || !value) continue;
        const barWidth = value * width;
        drawBar(top, base, (width - barWidth) / 2, barWidth);
      }
    }
  }

  public drawCurves(elements: CaratElementCurve[]) {
    const ratio = CaratDrawer.ratio;
    const scaleY = window.devicePixelRatio * this.scale;

    const translateX = ratio * this.columnTranslateX;
    const translateY = ratio * (this.columnTranslateY - scaleY * this.yMin);
    const matrix = new DOMMatrix([ratio, 0, 0, scaleY * ratio, translateX, translateY]);
    this.ctx.resetTransform();

    for (const element of elements) {
      const { thickness, color } = element.style;
      this.setLineSettings(ratio * thickness, color);

      const path = new Path2D();
      path.addPath(element.path, matrix);
      this.ctx.stroke(path);
    }
  }
}
