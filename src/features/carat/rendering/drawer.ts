import { CaratIntervalModel, CaratBarModel, CaratCurveModel, CurveAxisGroup } from '../lib/types';
import { polylineType } from '../../map/components/edit-panel/selecting/selecting-utils';
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


/** Отрисовщик каротажной диаграммы. */
export class CaratDrawer {
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
  /** Используемое по умолчанию семейство шрифтов. */
  public readonly fontFamily: string;

  /** Настройки внешнего вида гистограмм. */
  private barStyle: CaratBarPropertySettings | null;
  /** Настройки внешнего вида текста. */
  private textStyle: CaratTextPropertySettings | null;

  /** Ширина текста "-" для выравнивания отметок. */
  private minusWidth: number;
  /** Инклинометрия скважины для получения абсолютной отметки. */
  private inclinometry: ICaratInclinometry;

  private trackRect: Rectangle;
  private yMin: number;
  private yMax: number;
  private scale: number;

  private groupSettings: CaratColumnSettings;
  private groupElementRect: Rectangle;
  private groupTranslateX: number;
  private groupTranslateY: number;

  private columnRect: Rectangle;
  private columnWidth: number;
  private columnTranslateX: number;
  private columnTranslateY: number;

  constructor(config: CaratDrawerConfig) {
    this.trackBodySettings = createTrackBodyDrawSettings(config);
    this.trackHeaderSettings = createTrackHeaderDrawSettings(config);
    this.columnBodySettings = createColumnBodyDrawSettings(config);
    this.columnLabelSettings = createColumnLabelDrawSettings(config);
    this.columnYAxisSettings = createColumnYAxisDrawSettings(config);
    this.columnXAxesSettings = createColumnXAxesDrawSettings(config);
    this.fontFamily = config.stage.font.family;
  }

  public setContext(context: CanvasRenderingContext2D) {
    this.ctx = context;
    this.ctx.font = this.columnYAxisSettings.font;
    this.minusWidth = context.measureText('-').width;
  }

  public async getPattern(name: string, color: ColorHEX, backgroundColor: ColorHEX) {
    try {
      const img = await polylineType.getPattern(name, color, backgroundColor);
      return this.ctx.createPattern(img, 'repeat');
    }
    catch {
      return null;
    }
  }

  private getDrawMarksFn(settings: CaratColumnYAxis, textStart: number) {
    const { absMarks, depthMarks } = settings;
    let fn: (depth: number, canvasY: number) => void = CaratDrawer.emptyFn;

    if (depthMarks && absMarks && this.inclinometry) {
      const positiveStart = textStart + this.minusWidth;
      fn = (depth, canvasY) => {
        const absMark = this.inclinometry.getAbsMark(depth);
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillText(depth.toString(), depth < 0 ? textStart : positiveStart, canvasY);
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(absMark.toString(), absMark < 0 ? textStart : positiveStart, canvasY);
      };
    } else if (absMarks && this.inclinometry) {
      fn = (depth, canvasY) => {
        const absMark = this.inclinometry.getAbsMark(depth);
        this.ctx.fillText(absMark.toString(), textStart, canvasY);
      };
    } else if (depthMarks) {
      fn = (depth, canvasY) => {
        this.ctx.fillText(depth.toString(), textStart, canvasY);
      };
    }
    return fn;
  }

  /* --- Rendering --- */

  private setLineSettings(width: number, color: ColorHEX | CanvasPattern) {
    this.ctx.lineWidth = width;
    this.ctx.strokeStyle = color;
  }

  private setTextSettings(font: string, color: ColorHEX, align: CanvasTextAlign, baseline: CanvasTextBaseline) {
    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = baseline
  }

  private setTranslate(x: number, y: number) {
    const ratio = CaratDrawer.ratio;
    this.ctx.setTransform(ratio, 0, 0, ratio, ratio * x, ratio * y);
  }

  public setCurrentTrack(rect: Rectangle, viewport: CaratViewport, inclinometry: ICaratInclinometry) {
    this.trackRect = rect;
    this.yMin = viewport.y;
    this.scale = viewport.scale;
    this.inclinometry = inclinometry;
  }

  public setCurrentGroup(rect: Rectangle, settings: CaratColumnSettings) {
    this.groupSettings = settings;
    this.groupElementRect = rect;
    this.yMax = this.yMin + rect.height / this.scale;
    this.groupTranslateX = this.trackRect.left + this.groupElementRect.left;
    this.groupTranslateY = this.trackRect.top + this.groupElementRect.top;
  }

  public setCurrentColumn(
    rect: Rectangle,
    barStyle?: CaratBarPropertySettings, textStyle?: CaratTextPropertySettings,
  ) {
    this.columnRect = rect;
    this.barStyle = barStyle;
    this.textStyle = textStyle;

    const padding = this.columnBodySettings.padding;
    this.columnTranslateX = this.groupTranslateX + rect.left + padding;
    this.columnTranslateY = this.groupTranslateY + rect.top;
    this.columnWidth = rect.width - 2 * padding;

    this.ctx.save();
    this.setTranslate(this.columnTranslateX, this.columnTranslateY);
    this.ctx.beginPath();
    this.ctx.rect(-padding, 0, rect.width, rect.height);
    this.ctx.clip();
  }

  public restore() {
    this.ctx.restore();
  }

  public clear() {
    const { width, height } = this.ctx.canvas;
    this.ctx.resetTransform();
    this.ctx.clearRect(0, 0, width, height);
  }

  public clearTrackElementRect(headerHeight: number) {
    const { top, left, width, height } = this.trackRect;
    this.setTranslate(left, top);
    this.ctx.clearRect(0, headerHeight + this.trackHeaderSettings.height, width, height);
  }

  public drawTrackBody(label: string) {
    const { top, left, width, height } = this.trackRect;
    const { font, color, height: headerHeight } = this.trackHeaderSettings;
    const { borderColor, borderThickness } = this.trackBodySettings;
    const half = borderThickness / 2;

    this.setTranslate(left, top);
    this.setTextSettings(font, color, 'center', 'middle');
    this.ctx.fillText(label, width / 2, headerHeight / 2, width);

    this.setLineSettings(borderThickness, borderColor);
    this.ctx.beginPath();
    this.ctx.rect(-half, -half, width + half, height + half);
    this.ctx.moveTo(0, headerHeight);
    this.ctx.lineTo(width, headerHeight);
    this.ctx.stroke();
  }

  public drawGroupLabel(labelTop: number) {
    const width = this.groupElementRect.width;
    const { font, color, height } = this.columnLabelSettings;

    this.setTranslate(this.groupTranslateX, this.trackRect.top + this.trackHeaderSettings.height);
    this.setTextSettings(font, color, 'center', 'bottom');
    this.ctx.fillText(this.groupSettings.label, width / 2, labelTop + height, width);
  }

  public drawGroupXAxes(settings: CaratColumnXAxis, groups: CurveAxisGroup[]) {
    this.setTranslate(this.groupTranslateX, this.trackRect.top + this.columnLabelSettings.height);
    const { thickness, gap, axisHeight, markSize, font } = this.columnXAxesSettings;
    const yStep = axisHeight + gap;
    const segmentsCount = settings.numberOfMarks - 1;

    this.ctx.font = font;
    this.ctx.textBaseline = 'bottom';
    this.ctx.lineWidth = thickness;

    for (const { rect, axes } of groups) {
      const maxWidth = rect.width;
      let y = rect.top + rect.height;

      const xStart = rect.left + thickness, xEnd = rect.left + rect.width - thickness;
      const xCenter = (xStart + xEnd) / 2;

      for (const { type, axisMin, axisMax, style: { color } } of axes) {
        const delta = axisMax - axisMin;
        const markStep = delta / segmentsCount;
        const digits = markStep > 1 ? 0 : (markStep < 0.1 ? 2 : 1);

        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color;

        const markTop = y - markSize;
        this.ctx.beginPath();
        this.ctx.moveTo(xStart, markTop);
        this.ctx.lineTo(xStart, y);
        this.ctx.lineTo(xEnd, y);
        this.ctx.lineTo(xEnd, markTop);
        this.ctx.stroke();

        const typeHalfWidth = this.ctx.measureText(type).width / 2;
        const typeStart = xCenter - typeHalfWidth;
        const typeEnd = xCenter + typeHalfWidth;

        this.ctx.textAlign = 'left';
        this.ctx.fillText(axisMin.toString(), xStart + thickness, y, maxWidth);
        this.ctx.textAlign = 'right';
        this.ctx.fillText(axisMax.toString(), xEnd - thickness, y, maxWidth);
        this.ctx.textAlign = 'center';
        this.ctx.fillText(type, xCenter, y, maxWidth);

        for (let i = 1; i < segmentsCount; i++) {
          const xMark = i * markStep;
          const x = xStart + rect.width * (xMark / delta);

          const text = round(axisMin + xMark, digits).toString();
          const textHalfWidth = this.ctx.measureText(text).width / 2;
          const textStart = x - textHalfWidth;
          const textEnd = x + textHalfWidth;

          if (textEnd < typeStart || textStart > typeEnd) this.ctx.fillText(text, x, y, maxWidth);
        }
        y -= yStep;
      }
    }
  }

  public drawVerticalGrid(settings: CaratColumnXAxis, groups: CurveAxisGroup[]) {
    const height = this.groupElementRect.height;
    const { gridThickness, gridLineDash } = this.columnXAxesSettings;
    const segmentsCount = settings.numberOfMarks - 1;

    this.setTranslate(this.groupTranslateX, this.groupTranslateY);
    this.setLineSettings(gridThickness, this.groupSettings.borderColor);
    this.ctx.setLineDash(gridLineDash);
    this.ctx.lineDashOffset = this.yMin * window.devicePixelRatio * this.scale;
    this.ctx.beginPath();

    for (const { rect } of groups) {
      const xStart = rect.left;
      const step = rect.width / segmentsCount;

      for (let i = 1; i < segmentsCount; i++) {
        const x = xStart + i * step;
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, height);
      }
    }
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    this.ctx.lineDashOffset = 0;
  }

  public drawGroupBody(active: boolean) {
    const { width, height } = this.groupElementRect;
    const borderThickness = this.columnBodySettings.borderThickness;

    if (active) {
      this.setLineSettings(1.5 * borderThickness, this.columnBodySettings.activeBorderColor);
    } else {
      this.setLineSettings(borderThickness, this.groupSettings.borderColor);
    }
    this.setTranslate(this.groupTranslateX, this.groupTranslateY);
    this.ctx.strokeRect(0, 0, width, height);
  }

  public drawZoneDividingLines(coordinates: number[]) {
    this.setTranslate(this.groupTranslateX, this.groupTranslateY);
    this.setLineSettings(this.columnBodySettings.borderThickness, this.groupSettings.borderColor);

    const bottom = this.columnRect.top + this.columnRect.height;
    this.ctx.beginPath();

    for (const x of coordinates) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, bottom);
    }
    this.ctx.stroke();
  }

  public drawGroupYAxis(settings: CaratColumnYAxis) {
    const scaleY = window.devicePixelRatio * this.scale;
    this.setTranslate(this.groupTranslateX, this.groupTranslateY - scaleY * this.yMin);

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(0, scaleY * this.yMin, this.groupElementRect.width, this.groupElementRect.height);
    this.ctx.clip();

    const step = settings.step;
    const minY = Math.ceil(this.yMin / step - 1) * step;
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

    if (settings.grid) {
      const { gridThickness, gridLineDash } = this.columnYAxisSettings;
      const width = this.groupElementRect.width;

      this.setLineSettings(gridThickness, this.groupSettings.borderColor);
      this.ctx.setLineDash(gridLineDash);

      for (let y = minY; y < maxY; y += step) {
        const canvasY = y * scaleY;
        this.ctx.moveTo(0, canvasY);
        this.ctx.lineTo(width, canvasY);
      }
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  private drawIntervalText(text: string, xCenter: number, yCenter: number, maxWidth: number) {
    const { color, backgroundColor, fontSize: height, angle } = this.textStyle;
    this.ctx.font = `normal ${height}px ${this.fontFamily}`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    this.ctx.save();
    this.ctx.resetTransform();
    this.ctx.scale(CaratDrawer.ratio, CaratDrawer.ratio);

    const translateX = this.columnTranslateX;
    const translateY = this.columnTranslateY - (window.devicePixelRatio * this.scale) * this.yMin;
    this.ctx.translate(translateX + xCenter, translateY + yCenter);

    if (angle) this.ctx.rotate(-angle * Math.PI / 180);
    let width = this.ctx.measureText(text).width;
    if (width > maxWidth) width = maxWidth;

    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(-width / 2, -height / 2, width, height);
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, 0, 0, maxWidth);
    this.ctx.restore();
  }

  public drawIntervals(elements: CaratIntervalModel[]) {
    const scaleY = window.devicePixelRatio * this.scale;
    this.setTranslate(this.columnTranslateX, this.columnTranslateY - scaleY * this.yMin);

    for (let { top, bottom, style, text } of elements) {
      if (bottom < this.yMin || top > this.yMax) continue;
      const canvasTop = scaleY * top;
      const canvasHeight = scaleY * (bottom - top);

      this.ctx.fillStyle = style.fill;
      this.setLineSettings(2, style.stroke);

      this.ctx.beginPath();
      this.ctx.rect(0, canvasTop, this.columnWidth, canvasHeight);
      this.ctx.fill(); this.ctx.stroke();

      if (text !== undefined) {
        const xCenter = this.columnWidth / 2;
        const yCenter = canvasTop + canvasHeight / 2;
        this.drawIntervalText(text, xCenter, yCenter, this.columnWidth);
      }
    }
  }

  public drawBars(elements: CaratBarModel[]) {
    const scaleY = window.devicePixelRatio * this.scale;
    this.setTranslate(this.columnTranslateX, this.columnTranslateY - scaleY * this.yMin);

    const charCode = this.barStyle.align.charCodeAt(0);
    const { externalBorderColor, externalThickness } = this.barStyle;
    const { borderColor, backgroundColor, thickness } = this.barStyle;

    for (let { top, bottom, value, text } of elements) {
      if (bottom < this.yMin || top > this.yMax || !value) continue;
      const canvasTop = scaleY * top;
      const canvasHeight = scaleY * (bottom - top);

      const barWidth = value * this.columnWidth;
      let barStart = 0;                                                       // 'left'
      if (charCode === 114) barStart = this.columnWidth - barWidth;           // 'right'
      else if (charCode === 99) barStart = (this.columnWidth - barWidth) / 2; // 'center'

      this.setLineSettings(externalThickness, externalBorderColor);
      this.ctx.strokeRect(0, canvasTop, this.columnWidth, canvasHeight);

      this.ctx.fillStyle = backgroundColor;
      this.setLineSettings(thickness, borderColor);

      this.ctx.beginPath();
      this.ctx.rect(barStart, canvasTop, barWidth, canvasHeight);
      this.ctx.fill(); this.ctx.stroke();

      if (text !== undefined) {
        const xCenter = barStart + barWidth / 2;
        const yCenter = canvasTop + canvasHeight / 2;
        this.drawIntervalText(text, xCenter, yCenter, barWidth);
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
      let { thickness, color } = element.style;
      if (element.active) thickness *= 2;
      this.setLineSettings(ratio * thickness, color);

      const path = new Path2D();
      matrix.a = ratio * (this.columnWidth / (element.axisMax - element.axisMin));
      matrix.e = translateX - element.axisMin * matrix.a;
      path.addPath(element.path, matrix);
      this.ctx.stroke(path);
    }
    this.ctx.restore();
  }
}
