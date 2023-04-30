import { CaratElementInterval, CaratElementBar, CaratCurveModel, CurveAxisGroup } from '../lib/types';
import { round } from 'shared/lib';

import {
  CaratDrawerConfig, CaratTrackBodyDrawSettings, CaratTrackHeaderDrawSettings,
  CaratColumnBodyDrawSettings, CaratColumnLabelDrawSettings,
  CaratColumnYAxisDrawSettings, CaratColumnXAxesDrawSettings,
} from './drawer-settings';

import {
  createTrackBodyDrawSettings, createTrackHeaderDrawSettings,
  createColumnBodyDrawSettings, createColumnLabelDrawSettings,
  createColumnYAxisDrawSettings, createColumnXAxesDrawSettings,
} from './drawer-settings';


interface ICaratDrawer {
  setContext(context: CanvasRenderingContext2D): void
  setCurrentTrack(rect: BoundingRect, viewport: CaratViewport): void
  setCurrentGroup(rect: BoundingRect, settings: CaratColumnSettings): void
  clear(): void

  drawTrackBody(well: string, headersHeight: number): void
  drawColumnGroupBody(labelBottom: number, active: boolean): void
  drawColumnGroupYAxis(settings: CaratColumnYAxis): void
  drawColumnGroupXAxes(settings: CaratColumnXAxis, groups: CurveAxisGroup[]): void
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
  /** Настройки отрисовки горизонтальных осей. колонки. */
  public readonly columnXAxesSettings: CaratColumnXAxesDrawSettings;

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
    this.columnXAxesSettings = createColumnXAxesDrawSettings(config);
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

  public drawColumnGroupBody(labelBottom: number, active: boolean) {
    const { width, height } = this.groupElementRect;
    const { font, color } = this.columnLabelSettings;
    const { borderThickness } = this.columnBodySettings;

    this.setTranslate(this.groupTranslateX, this.trackRect.top);
    this.setTextSettings(font, color, 'center', 'bottom');
    this.ctx.fillText(this.groupSettings.label, width / 2, labelBottom, width);

    if (active) {
      this.setLineSettings(1.5 * borderThickness, this.columnBodySettings.activeBorderColor);
    } else {
      this.setLineSettings(borderThickness, this.groupSettings.borderColor);
    }
    this.setTranslate(this.groupTranslateX, this.groupTranslateY);
    this.ctx.strokeRect(0, 0, width, height);
  }

  public drawColumnGroupYAxis(settings: CaratColumnYAxis) {
    const scaleY = window.devicePixelRatio * this.scale;
    this.setTranslate(this.groupTranslateX, this.groupTranslateY - scaleY * this.yMin);

    const step = settings.step;
    const minY = Math.ceil(this.yMin / step) * step;
    const maxY = minY + this.groupElementRect.height / this.scale;

    const { font, color, markSize } = this.columnYAxisSettings;
    const drawMarksFn = this.getDrawMarksFn(settings, 1.1 * markSize);

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

  public drawColumnGroupXAxes(settings: CaratColumnXAxis, groups: CurveAxisGroup[]) {
    this.setTranslate(this.groupTranslateX, this.trackRect.top + this.columnLabelSettings.height);
    const { thickness, gap, axisHeight, markSize, font } = this.columnXAxesSettings;
    const yStep = axisHeight + gap;
    const segmentsCount = settings.numberOfMarks - 1;
    const coordinates: number[] = [];

    this.ctx.font = font;
    this.ctx.textBaseline = 'bottom';
    this.ctx.lineWidth = thickness;

    for (const { rect, axes } of groups) {
      let y = rect.top + rect.height;
      const xStart = rect.left + thickness, xEnd = rect.left + rect.width - thickness;

      for (const { type, axisMin, axisMax, style: { color } } of axes) {
        const delta = axisMax - axisMin;
        const markStep = delta / segmentsCount;
        const digits = markStep > 1 ? 0 : (markStep < 0.1 ? 2 : 1);

        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color;

        const markTop = y - markSize;
        const markBottom = y + thickness / 2;

        this.ctx.beginPath();
        this.ctx.moveTo(xStart, y);
        this.ctx.lineTo(xEnd, y);
        this.ctx.moveTo(xStart, markTop);
        this.ctx.lineTo(xStart, markBottom);
        this.ctx.moveTo(xEnd, markTop);
        this.ctx.lineTo(xEnd, markBottom);
        this.ctx.stroke();

        this.ctx.textAlign = 'left';
        this.ctx.fillText(axisMin.toString(), xStart + thickness, y);
        this.ctx.textAlign = 'right';
        this.ctx.fillText(axisMax.toString(), xEnd - thickness, y);
        this.ctx.textAlign = 'center';
        this.ctx.fillText(type, (xStart + xEnd) / 2, y);

        for (let i = 1; i < segmentsCount; i++) {
          const xMark = i * markStep;
          const x = xStart + rect.width * (xMark / delta);
          coordinates.push(x);
          this.ctx.fillText(round(axisMin + xMark, digits).toString(), x, y);
        }
        y -= yStep;
      }
    }
    if (settings.grid) {
      const height = this.groupElementRect.height;
      const { gridThickness, gridLineDash } = this.columnXAxesSettings;

      this.setTranslate(this.groupTranslateX, this.groupTranslateY);
      this.setLineSettings(gridThickness, this.groupSettings.borderColor);
      this.ctx.setLineDash(gridLineDash);
      this.ctx.beginPath();

      for (const x of coordinates) {
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, height);
      }
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }
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
      matrix.a = ratio * (this.columnWidth / element.axisMax);
      matrix.e = translateX - element.axisMin * matrix.a;
      path.addPath(element.path, matrix);
      this.ctx.stroke(path);
    }
    this.ctx.lineJoin = 'miter';
  }
}
