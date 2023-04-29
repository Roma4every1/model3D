import { CaratElementInterval, CaratElementBar, CaratCurveModel } from '../lib/types';

import {
  CaratDrawerConfig, CaratTrackBodyDrawSettings, CaratTrackHeaderDrawSettings,
  CaratColumnBodyDrawSettings, CaratColumnLabelDrawSettings, CaratColumnYAxisDrawSettings,
} from './drawer-settings';

import {
  createTrackBodyDrawSettings, createTrackHeaderDrawSettings,
  createColumnBodyDrawSettings, createColumnLabelDrawSettings, createColumnYAxisDrawSettings,
} from './drawer-settings';


interface ICaratDrawer {
  setContext(context: CanvasRenderingContext2D): void
  setCurrentTrack(rect: BoundingRect, viewport: CaratViewport): void
  setCurrentGroup(rect: BoundingRect, settings: CaratColumnSettings): void
  clear(): void

  drawTrackBody(well: string, headersHeight: number): void
  drawColumnGroupBody(active: boolean): void
  drawColumnGroupYAxis(axis: CaratColumnYAxis): void
  drawZoneDividingLines(coordinates: number[]): void

  drawCurves(elements: CaratCurveModel[]): void
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
  /** Настройки отрисовки тела колонки. */
  public readonly columnBodySettings: CaratColumnBodyDrawSettings;
  /** Настройки отрисовки подписи колонки. */
  public readonly columnLabelSettings: CaratColumnLabelDrawSettings;
  /** Настройки отрисовки вертикальной оси колонки. */
  public readonly columnYAxisSettings: CaratColumnYAxisDrawSettings;

  private trackRect: BoundingRect;
  private yMin: number;
  private yMax: number;
  private scale: number;

  private groupSettings: CaratColumnSettings;
  private groupElementRect: BoundingRect;
  private groupTranslateX: number;
  private groupTranslateY: number;

  private columnRect: BoundingRect;
  private columnWidth: number;
  private columnTranslateX: number;
  private columnTranslateY: number;

  private minusWidth: number;

  constructor(config: CaratDrawerConfig) {
    this.trackBodySettings = createTrackBodyDrawSettings(config);
    this.trackHeaderSettings = createTrackHeaderDrawSettings(config);
    this.columnBodySettings = createColumnBodyDrawSettings(config);
    this.columnLabelSettings = createColumnLabelDrawSettings(config);
    this.columnYAxisSettings = createColumnYAxisDrawSettings(config);
  }

  public setContext(context: CanvasRenderingContext2D) {
    this.ctx = context;
    this.ctx.font = this.columnYAxisSettings.font;
    this.minusWidth = context.measureText('-').width;
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

  private setTranslate(x: number, y: number) {
    const ratio = CaratDrawer.ratio;
    this.ctx.setTransform(ratio, 0, 0, ratio, ratio * x, ratio * y);
  }

  public setCurrentTrack(rect: BoundingRect, viewport: CaratViewport) {
    this.trackRect = rect;
    this.yMin = viewport.y;
    this.scale = viewport.scale;
  }

  public setCurrentGroup(rect: BoundingRect, settings: CaratColumnSettings) {
    this.groupSettings = settings;
    this.groupElementRect = rect;
    this.yMax = this.yMin + rect.height / this.scale;
    this.groupTranslateX = this.trackRect.left + this.groupElementRect.left;
    this.groupTranslateY = this.trackRect.top + this.groupElementRect.top;
  }

  public setCurrentColumn(rect: BoundingRect) {
    this.columnRect = rect;
    const padding = this.columnBodySettings.padding;
    this.columnTranslateX = this.groupTranslateX + rect.left + padding;
    this.columnTranslateY = this.groupTranslateY + rect.top;
    this.columnWidth = rect.width - 2 * padding;
  }

  public clear() {
    const { width, height } = this.ctx.canvas;
    this.ctx.resetTransform();
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

  public drawColumnGroupBody(active: boolean) {
    const { width, height } = this.groupElementRect;
    const { font, color } = this.columnLabelSettings;
    const { borderThickness } = this.columnBodySettings;

    this.setTranslate(this.groupTranslateX, this.groupTranslateY);
    this.setTextSettings(font, color, 'center', 'bottom');
    this.ctx.fillText(this.groupSettings.label, width / 2, 0, width);

    if (active) {
      this.setLineSettings(1.5 * borderThickness, this.columnBodySettings.activeBorderColor);
    } else {
      this.setLineSettings(borderThickness, this.groupSettings.borderColor);
    }
    this.ctx.strokeRect(0, 0, width, height);
  }

  public drawColumnGroupYAxis(axis: CaratColumnYAxis) {
    const scaleY = window.devicePixelRatio * this.scale;
    this.setTranslate(this.groupTranslateX, this.groupTranslateY - scaleY * this.yMin);

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

  public drawZoneDividingLines(coordinates: number[]) {
    this.setTranslate(this.groupTranslateX, this.groupTranslateY);
    this.setLineSettings(1, this.groupSettings.borderColor);

    const bottom = this.columnRect.top + this.columnRect.height;
    this.ctx.beginPath();

    for (const x of coordinates) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, bottom);
    }
    this.ctx.stroke();
  }

  public drawIntervals(elements: CaratElementInterval[]) {
    const scaleY = window.devicePixelRatio * this.scale;
    this.setTranslate(this.columnTranslateX, this.columnTranslateY - scaleY * this.yMin);

    for (let { top, base, style } of elements) {
      if (base < this.yMin || top > this.yMax) continue;
      const canvasTop = scaleY * top;
      const canvasHeight = scaleY * (base - top);

      this.setLineSettings(2, style.borderColor);
      this.ctx.fillStyle = style.backgroundColor;
      this.ctx.fillRect(0, canvasTop, this.columnWidth, canvasHeight);
      this.ctx.strokeRect(0, canvasTop, this.columnWidth, canvasHeight);
    }
  }

  public drawBars(elements: CaratElementBar[], settings: CaratBarPropertySettings) {
    const scaleY = window.devicePixelRatio * this.scale;
    this.setTranslate(this.columnTranslateX, this.columnTranslateY - scaleY * this.yMin);

    const charCode = settings.align.charCodeAt(0);
    const { borderColor, backgroundColor, thickness, externalBorderColor, externalThickness } = settings;

    const drawBar = (top, base, barStart, barWidth) => {
      const canvasTop = scaleY * top;
      const canvasHeight = scaleY * (base - top);

      this.setLineSettings(externalThickness, externalBorderColor);
      this.ctx.strokeRect(0, canvasTop, this.columnWidth, canvasHeight);

      this.ctx.fillStyle = backgroundColor;
      this.ctx.fillRect(barStart, canvasTop, barWidth, canvasHeight);

      this.setLineSettings(thickness, borderColor);
      this.ctx.strokeRect(barStart, canvasTop, barWidth, canvasHeight);
    };

    if (charCode === 108) { // 'left'
      for (let { top, base, value } of elements) {
        if (base < this.yMin || top > this.yMax || !value) continue;
        const barWidth = value * this.columnWidth;
        drawBar(top, base, 0, barWidth);
      }
    } else if (charCode === 114) { // 'right'
      for (let { top, base, value } of elements) {
        if (base < this.yMin || top > this.yMax || !value) continue;
        const barWidth = value * this.columnWidth;
        drawBar(top, base, this.columnWidth - barWidth, barWidth);
      }
    } else { // 'center'
      for (let { top, base, value } of elements) {
        if (base < this.yMin || top > this.yMax || !value) continue;
        const barWidth = value * this.columnWidth;
        drawBar(top, base, (this.columnWidth - barWidth) / 2, barWidth);
      }
    }
  }

  public drawCurves(elements: CaratCurveModel[]) {
    const ratio = CaratDrawer.ratio;
    const scaleY = window.devicePixelRatio * this.scale;

    const translateX = ratio * this.columnTranslateX;
    const translateY = ratio * (this.columnTranslateY - scaleY * this.yMin);
    const matrix = new DOMMatrix([1, 0, 0, scaleY * ratio, translateX, translateY]);

    this.ctx.resetTransform();
    this.ctx.lineJoin = 'round';

    for (const element of elements) {
      const { thickness, color } = element.style;
      this.setLineSettings(ratio * thickness, color);

      const path = new Path2D();
      matrix.a = ratio * (this.columnWidth / element.max);
      path.addPath(element.path, matrix);
      this.ctx.stroke(path);
    }
    this.ctx.lineJoin = 'miter';
  }
}
