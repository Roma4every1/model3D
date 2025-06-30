import type {
  CaratColumnSettings, CaratColumnXAxis, CaratColumnYAxis,
  CaratTextPropertySettings, CaratBarPropertySettings,
} from '../lib/dto.types';

import type {
  CaratIntervalModel, CaratBarModel,
  CaratCurveModel, CaratGroupState, CaratCorrelation,
} from '../lib/types';

import type {
  WellBoreElementModel, WellBoreElementStyle, CaratImageModel,
  CaratVerticalLineModel, CaratWellFaceModel, ConstructionLabel,
} from '../lib/construction.types';

import type {
  CaratMarkModel, CaratMarkSettings,
} from '../lib/mark.types';

import type {
  CaratDrawerConfig, CaratTrackBodyDrawSettings,
  CaratTrackHeaderDrawSettings, CaratColumnBodyDrawSettings,
  CaratColumnLabelDrawSettings, CaratMarkDrawSettings,
  CaratColumnYAxisDrawSettings, CaratColumnXAxisDrawSettings,
  CaratCorrelationDrawSettings, ConstructionDrawSettings,
} from './drawer-settings';

import {
  createTrackBodyDrawSettings, createTrackHeaderDrawSettings, createColumnBodyDrawSettings,
  createColumnLabelDrawSettings, createMarkDrawSettings, createColumnYAxisDrawSettings,
  createColumnXAxisDrawSettings, createCorrelationDrawSettings, createConstructionDrawSettings,
} from './drawer-settings';

import { round } from 'shared/lib';
import { formatFlowDate } from '../lib/utils';
import { ConstructionTransformer } from '../lib/transformer';


/** Отрисовщик каротажной диаграммы. */
export class CaratDrawer {
  /** Количество пикселей в метре: `96px = 2.54cm`. */
  public static readonly pixelPerMeter = 100 * 96 / 2.54;
  /** Коэффициент уплотнения DPI для улучшения чёткости изображения. */
  public static ratio = 2;

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
  /** Настроки отрисовки подписей по глубине. */
  public readonly markSettings: CaratMarkDrawSettings;
  /** Настройки отрисовки вертикальной оси колонки. */
  public readonly columnYAxisSettings: CaratColumnYAxisDrawSettings;
  /** Настройки отрисовки горизонтальных осей. колонки. */
  public readonly columnXAxisSettings: CaratColumnXAxisDrawSettings;
  /** Настройки отрисовки корреляций. */
  public readonly correlationSettings: CaratCorrelationDrawSettings;
  /** Настройки отрисовки конструкции. */
  public readonly constructionSettings: ConstructionDrawSettings;
  /** Используемое по умолчанию семейство шрифтов. */
  public readonly fontFamily: string;

  /** Настройки внешнего вида текста. */
  private textStyle: CaratTextPropertySettings | null;
  /** Ширина текста "-" для выравнивания отметок. */
  private minusWidth: number;
  /** Инклинометрия скважины для получения абсолютной отметки. */
  private inclinometry: ICaratInclinometry;
  /** Вспомогательный класс для показа конструкции скважины. */
  private transformer: ConstructionTransformer;

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
    this.markSettings = createMarkDrawSettings(config);
    this.columnYAxisSettings = createColumnYAxisDrawSettings(config);
    this.columnXAxisSettings = createColumnXAxisDrawSettings(config);
    this.correlationSettings = createCorrelationDrawSettings(config);
    this.constructionSettings = createConstructionDrawSettings(config);
    this.fontFamily = config.stage.font.family;
  }

  public setContext(ctx: CanvasRenderingContext2D): void {
    this.ctx = ctx;
    this.ctx.font = this.columnYAxisSettings.font;
    this.minusWidth = ctx.measureText('-').width;
  }

  private getDrawMarksFn(settings: CaratColumnYAxis, markSize: number) {
    const textStart = 1.1 * markSize;
    const { absMarks, depthMarks } = settings;
    let fn: (depth: number, canvasY: number) => void = CaratDrawer.emptyFn;

    if (depthMarks && absMarks && this.inclinometry) {
      const positiveStart = textStart + this.minusWidth;
      fn = (depth, canvasY) => {
        this.ctx.moveTo(0, canvasY);
        this.ctx.lineTo(markSize, canvasY);
        const absMark = this.inclinometry.getAbsMark(depth);
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillText(depth.toString(), depth < 0 ? textStart : positiveStart, canvasY);
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(absMark.toString(), absMark < 0 ? textStart : positiveStart, canvasY);
      };
    } else if (absMarks && this.inclinometry) {
      fn = (depth, canvasY) => {
        this.ctx.moveTo(0, canvasY);
        this.ctx.lineTo(markSize, canvasY);
        const absMark = this.inclinometry.getAbsMark(depth);
        this.ctx.fillText(absMark.toString(), textStart, canvasY);
      };
    } else if (depthMarks) {
      fn = (depth, canvasY) => {
        this.ctx.moveTo(0, canvasY);
        this.ctx.lineTo(markSize, canvasY);
        this.ctx.fillText(depth.toString(), textStart, canvasY);
      };
    }
    return fn;
  }

  /* --- Rendering --- */

  private setLineSettings(width: number, color: ColorString | CanvasPattern): void {
    this.ctx.lineWidth = width;
    this.ctx.strokeStyle = color;
  }

  private setTextSettings(font: string, color: ColorString, align: CanvasTextAlign, baseline: CanvasTextBaseline): void {
    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = baseline
  }

  private setTranslate(x: number, y: number): void {
    const ratio = CaratDrawer.ratio;
    this.ctx.setTransform(ratio, 0, 0, ratio, ratio * x, ratio * y);
  }

  public setCurrentTrack(
    rect: Rectangle, viewport: CaratViewport,
    inclinometry: ICaratInclinometry, transformer: ConstructionTransformer,
  ): void {
    this.trackRect = rect;
    this.yMin = viewport.y;
    this.scale = viewport.scale;
    this.inclinometry = inclinometry;
    this.transformer = transformer;
  }

  public setCurrentGroup(rect: Rectangle, settings: CaratColumnSettings): void {
    this.groupSettings = settings;
    this.groupElementRect = rect;
    this.yMax = this.yMin + rect.height / (this.scale * window.devicePixelRatio);
    this.groupTranslateX = this.trackRect.left + this.groupElementRect.left;
    this.groupTranslateY = this.trackRect.top + this.groupElementRect.top;
  }

  public setCurrentColumn(rect: Rectangle, textStyle?: CaratTextPropertySettings): void {
    this.columnRect = rect;
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

  public restore(): void {
    this.ctx.restore();
  }

  public clear(): void {
    const { width, height } = this.ctx.canvas;
    this.ctx.resetTransform();
    this.ctx.clearRect(0, 0, width, height);
  }

  public clearTrackElementRect(headerHeight: number): void {
    const { top, left, width, height } = this.trackRect;
    this.setTranslate(left, top);
    this.ctx.clearRect(0, headerHeight + this.trackHeaderSettings.height, width, height);
  }

  /* --- Rendering --- */

  public drawTrackBody(label: string, active: boolean): void {
    const { top, left, width, height } = this.trackRect;
    const { font, color, height: headerHeight } = this.trackHeaderSettings;
    const { borderColor, borderWidth, activeColor } = this.trackBodySettings;
    const half = borderWidth / 2;

    this.setTranslate(left, top);
    if (active) {
      this.ctx.fillStyle = activeColor;
      this.ctx.fillRect(-half, -half, width + half, headerHeight);
    }

    this.setTextSettings(font, color, 'center', 'middle');
    this.ctx.fillText(label, width / 2, headerHeight / 2, width);

    this.setLineSettings(borderWidth, borderColor);
    this.ctx.beginPath();
    this.ctx.rect(-half, -half, width + half, height + half);
    this.ctx.moveTo(0, headerHeight);
    this.ctx.lineTo(width, headerHeight);
    this.ctx.stroke();
  }

  public drawGroupLabel(labelTop: number, flow?: boolean): void {
    const width = this.groupElementRect.width;
    const { font, color, height } = this.columnLabelSettings;

    this.setTranslate(this.groupTranslateX, this.trackRect.top + this.trackHeaderSettings.height);
    this.setTextSettings(font, color, 'center', 'bottom');
    const y = (flow && this.groupSettings.label) ? labelTop : labelTop + height;
    this.ctx.fillText(this.groupSettings.label, width / 2, y, width);
  }

  public drawGroupXAxes(settings: CaratColumnXAxis, groups: CaratGroupState[], activeType: CaratCurveType): void {
    this.setTranslate(this.groupTranslateX, this.trackRect.top + this.columnLabelSettings.height);
    const { thickness, gap, axisHeight, font, activeFont } = this.columnXAxisSettings;
    const yStep = axisHeight + gap;
    const segmentsCount = settings.numberOfMarks - 1;

    this.ctx.textBaseline = 'bottom';
    this.ctx.lineWidth = thickness;

    for (const { rect, elements } of groups) {
      const maxWidth = rect.width;
      let y = rect.top + rect.height;

      const xStart = rect.left + thickness;
      const xEnd = rect.left + rect.width - thickness;
      const xCenter = (xStart + xEnd) / 2;

      for (const { type, axisMin, axisMax, style: { color } } of elements as CaratCurveModel[]) {
        const delta = axisMax - axisMin;
        const markStep = delta / segmentsCount;
        const digits = markStep > 1 ? 0 : (markStep < 0.1 ? 2 : 1);

        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color;
        this.ctx.font = type === activeType ? activeFont : font;

        const markTop = y - thickness * 4;
        this.ctx.beginPath();
        this.ctx.moveTo(xStart, markTop);
        this.ctx.lineTo(xStart, y);
        this.ctx.lineTo(xEnd, y);
        this.ctx.lineTo(xEnd, markTop);
        this.ctx.stroke();

        const typeHalfWidth = this.ctx.measureText(type).width / 2;
        const typeStart = xCenter - typeHalfWidth;
        const typeEnd = xCenter + typeHalfWidth;

        const minLabelWidth = this.ctx.measureText(axisMin.toString()).width;
        const maxLabelWidth = this.ctx.measureText(axisMax.toString()).width;

        // Свободные промежутки между метками
        let freeStartLeft = xStart + minLabelWidth;
        let freeEndLeft = typeStart;
        let freeStartRight = typeEnd;
        let freeEndRight = xEnd - maxLabelWidth;

        // Проверка наличия места для первой и последней метки
        const showFirstLabel = freeEndLeft - freeStartLeft >= 0;
        const showLastLabel = freeEndRight - freeStartRight >= 0;

        if (showFirstLabel) {
          this.ctx.textAlign = 'left';
          this.ctx.fillText(axisMin.toString(), xStart + thickness, y, maxWidth);
        }
        if (showLastLabel) {
          this.ctx.textAlign = 'right';
          this.ctx.fillText(axisMax.toString(), xEnd - thickness, y, maxWidth);
        }
        this.ctx.textAlign = 'center';
        this.ctx.fillText(type, xCenter, y, maxWidth);

        for (let i = 1; i < segmentsCount; i++) {
          const xMark = i * markStep;
          const x = xStart - thickness + rect.width * (xMark / delta);

          const text = round(axisMin + xMark, digits).toString();
          const textHalfWidth = this.ctx.measureText(text).width / 2;
          const textStart = x - textHalfWidth;
          const textEnd = x + textHalfWidth;

          if ((textEnd <= freeEndLeft && textStart >= freeStartLeft) || (textEnd <= freeEndRight && textStart >= freeStartRight)) {
            this.ctx.fillText(text, x, y, maxWidth);

            // Обновление свободных промежутков
            if (textEnd <= freeEndLeft) {
              freeStartLeft = textEnd;
            } else if (textEnd <= freeEndRight) {
              freeStartRight = textEnd;
            }
          }
        }
        y -= yStep;
      }
    }
  }

  public drawGroupFlow(groups: CaratGroupState[], labelTop: number): void {
    const { font, color, height } = this.columnLabelSettings;
    this.setTranslate(this.groupTranslateX, this.trackRect.top + this.trackHeaderSettings.height);
    this.setTextSettings(font, color, 'center', 'bottom');

    for (const { rect, elements } of groups) {
      if (elements.length === 0) continue;
      const y = this.groupSettings.label ? labelTop + height : labelTop;
      const label = formatFlowDate(elements[0].date);
      this.ctx.fillText(label, rect.left + rect.width / 2, y, rect.width);
    }
  }

  public drawVerticalGrid(groups: CaratGroupState[], settings: CaratColumnXAxis): void {
    const height = this.groupElementRect.height;
    const { gridThickness, gridLineDash } = this.columnXAxisSettings;
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

  public drawGroupBody(active: boolean): void {
    const { width, height } = this.groupElementRect;
    const borderWidth = this.columnBodySettings.borderWidth;

    if (active) {
      this.setLineSettings(1.5 * borderWidth, this.columnBodySettings.activeBorderColor);
    } else {
      this.setLineSettings(borderWidth, this.groupSettings.borderColor);
    }
    this.setTranslate(this.groupTranslateX, this.groupTranslateY);
    this.ctx.strokeRect(0, 0, width, height);
  }

  public drawZoneDividingLines(coordinates: number[]): void {
    this.setTranslate(this.groupTranslateX, this.groupTranslateY);
    this.setLineSettings(this.columnBodySettings.borderWidth, this.groupSettings.borderColor);

    const bottom = this.columnRect.top + this.columnRect.height;
    this.ctx.beginPath();

    for (const x of coordinates) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, bottom);
    }
    this.ctx.stroke();
  }

  public drawGroupYAxis(settings: CaratColumnYAxis): void {
    const scaleY = window.devicePixelRatio * this.scale;
    this.setTranslate(this.groupTranslateX, this.groupTranslateY - scaleY * this.yMin);

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(0, scaleY * this.yMin, this.groupElementRect.width, this.groupElementRect.height);
    this.ctx.clip();

    const step = this.transformer ? this.transformer.step : settings.step;
    const minY = Math.ceil(this.yMin / step - 1) * step;
    const maxY = minY + (this.yMax - this.yMin) + step;

    const { font, color, markSize } = this.columnYAxisSettings;
    const drawMarksFn = this.getDrawMarksFn(settings, markSize);

    this.setLineSettings(2, color);
    this.setTextSettings(font, color, 'left', 'middle');
    this.ctx.beginPath();

    if (this.transformer) {
      for (const { y, ty } of this.transformer.anchorPoints) {
        drawMarksFn(y, ty * scaleY);
      }
    } else {
      for (let y = minY; y < maxY; y += step) {
        drawMarksFn(y, y * scaleY);
      }
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

  private drawIntervalText(text: string, xCenter: number, yCenter: number, maxWidth: number): void {
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

  public drawIntervals(elements: CaratIntervalModel[]): void {
    const scaleY = window.devicePixelRatio * this.scale;
    this.setTranslate(this.columnTranslateX, this.columnTranslateY - scaleY * this.yMin);

    for (const { top, bottom, style, text } of elements) {
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

  public drawBars(elements: CaratBarModel[], options: CaratBarPropertySettings): void {
    const scaleY = window.devicePixelRatio * this.scale;
    this.setTranslate(this.columnTranslateX, this.columnTranslateY - scaleY * this.yMin);

    const charCode = options.align.charCodeAt(0);
    const { externalBorderColor, externalThickness } = options;
    const { borderColor, backgroundColor, thickness } = options;

    for (const { top, bottom, value, text } of elements) {
      if (bottom < this.yMin || top > this.yMax) continue;
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
        const xCenter = this.columnWidth / 2;
        const yCenter = canvasTop + canvasHeight / 2;
        this.drawIntervalText(text, xCenter, yCenter, this.columnWidth);
      }
    }
  }

  /** Отрисовка подписей по глубине. */
  public drawMarks(elements: CaratMarkModel[], settings: CaratMarkSettings, maxWidth: number): void {
    const scaleY = window.devicePixelRatio * this.scale;
    this.setTranslate(this.columnTranslateX, this.columnTranslateY - scaleY * this.yMin);

    const { padding: textPadding, borderWidth } = this.markSettings;
    const { align, nAlign, font, fontSize, color, backgroundColor, borderColor } = settings.text;
    const { color: lineColor, width: lineWidth, dasharray } = settings.line;

    let x = textPadding;
    if (nAlign === 0) {
      x = this.columnWidth / 2;
    } else if (nAlign === 1) {
      x = this.columnWidth - textPadding;
    }

    for (const { depth, depthText, lines, maxLineWidth } of elements) {
      if (depth < this.yMin || depth > this.yMax) continue;
      const y = depth * scaleY;

      if (settings.showLine) {
        if (dasharray.length) this.ctx.setLineDash(dasharray);
        this.setLineSettings(lineWidth, lineColor);
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.columnWidth, y);
        this.ctx.stroke();
        if (dasharray.length) this.ctx.setLineDash([]);
      }
      const boxHeight = (fontSize + textPadding) * lines.length + textPadding;
      const boxY = y - boxHeight;

      if (backgroundColor || borderColor) {
        const boxWidth = maxLineWidth + 2 * textPadding;

        let boxX = 0;
        if (nAlign === 0) {
          boxX = x - maxLineWidth / 2 - textPadding;
        } else if (nAlign === 1) {
          boxX = x - maxLineWidth - textPadding;
        }

        if (borderColor) {
          this.setLineSettings(borderWidth, borderColor);
          this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        }
        if (backgroundColor) {
          this.ctx.fillStyle = backgroundColor;
          this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        }
      }
      let textY = boxY + textPadding;
      this.setTextSettings(font, color, align, 'top');

      for (const line of lines) {
        this.ctx.fillText(line, x, textY, maxWidth);
        textY += textPadding + fontSize;
      }

      if (settings.showDepth) {
        const boxWidth = settings.depthTextWidth + textPadding;
        const boxX = nAlign === -1 ? this.columnWidth - boxWidth : 0;
        const boxY = y - fontSize;

        if (borderColor) {
          this.setLineSettings(borderWidth, borderColor);
          this.ctx.strokeRect(boxX, boxY, boxWidth, fontSize);
        }
        if (backgroundColor) {
          this.ctx.fillStyle = backgroundColor;
          this.ctx.fillRect(boxX, boxY, boxWidth, fontSize);
        }
        this.setTextSettings(font, color, 'center', 'bottom');
        this.ctx.fillText(depthText, boxX + boxWidth / 2, y + borderWidth);
      }
    }
  }

  /** Отрисовка элементов ствола конструкции скважины. */
  public drawWellBore(elements: WellBoreElementModel[], style: WellBoreElementStyle): void {
    const scaleY = window.devicePixelRatio * this.scale;
    this.setTranslate(this.columnTranslateX, this.columnTranslateY - scaleY * this.yMin);

    for (const { top, bottom, innerDiameter, outerDiameter, cement } of elements) {
      if (bottom < this.yMin || top > this.yMax) continue;
      const innerX = (this.columnWidth - innerDiameter) / 2;
      const outerX = (this.columnWidth - outerDiameter) / 2;

      const canvasTop = scaleY * top;
      const canvasHeight = scaleY * (bottom - top);
      const cementHeight = scaleY * (bottom - cement);

      if (cement !== null) {
        this.ctx.fillStyle = style.cementColor;
        this.ctx.fillRect(outerX - 4, cement * scaleY, outerDiameter + 8, cementHeight);
      }
      this.ctx.fillStyle = style.outerColor;
      this.ctx.fillRect(outerX, canvasTop, outerDiameter, canvasHeight);
      this.ctx.fillStyle = style.innerColor;
      this.ctx.fillRect(innerX, canvasTop, innerDiameter, canvasHeight);
    }
  }

  /** Отрисовка изображений. */
  public drawImages(elements: CaratImageModel[]): void {
    const scaleY = window.devicePixelRatio * this.scale;
    this.setTranslate(this.columnTranslateX, this.columnTranslateY - scaleY * this.yMin);

    for (const { top, bottom, image } of elements) {
      if (bottom < this.yMin || top > this.yMax) continue;
      const dx = (this.columnWidth - image.width) / 2;
      const dy = (scaleY * (top + bottom) / 2) - image.height / 2;
      this.ctx.drawImage(image, dx, dy);
    }
  }

  /** Отрисовка забоев скважины. */
  public drawWellFaces(elements: CaratWellFaceModel[]): void {
    const scaleY = window.devicePixelRatio * this.scale;
    this.setTranslate(this.columnTranslateX, this.columnTranslateY - scaleY * this.yMin);
    this.ctx.lineWidth = this.constructionSettings.faceBorderWidth;

    for (const { top, bottom, diameter, style } of elements) {
      if (bottom < this.yMin || top > this.yMax) continue;
      const canvasTop = scaleY * top;
      const canvasHeight = scaleY * (bottom - top);
      const x = (this.columnWidth - diameter) / 2;
      this.ctx.fillStyle = style.fill;
      this.ctx.fillRect(x, canvasTop, diameter, canvasHeight);
      this.ctx.strokeStyle = style.stroke;
      this.ctx.strokeRect(x, canvasTop, diameter, canvasHeight);
    }
  }

  /** Отрисовка центральных вертикальных линий. */
  public drawVerticalLines(elements: CaratVerticalLineModel[], color: ColorString): void {
    const scaleY = window.devicePixelRatio * this.scale;
    this.setTranslate(this.columnTranslateX, this.columnTranslateY - scaleY * this.yMin);

    this.ctx.setLineDash(this.constructionSettings.verticalLineDash);
    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    const x = this.columnWidth / 2;

    for (const { top, bottom, width } of elements) {
      if (bottom < this.yMin || top > this.yMax) continue;
      this.ctx.lineWidth = width;
      this.ctx.moveTo(x, scaleY * top);
      this.ctx.lineTo(x, scaleY * bottom);
    }
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  /** Отрисовка подписей элементов конструкции. */
  public drawConstructionLabels(dataRect: Rectangle, labelRect: Rectangle, labels: ConstructionLabel[]): void {
    const scaleY = window.devicePixelRatio * this.scale;
    this.setCurrentGroup(labelRect, null);
    this.setTranslate(this.groupTranslateX, this.groupTranslateY);

    const { labelMargin: boxMargin, labelPadding: boxPadding } = this.constructionSettings;
    const { labelColor, labelBackground, labelTextHeight } = this.constructionSettings;
    const { labelBorderColor, labelBorderWidth } = this.constructionSettings;

    let boxY = boxMargin;
    let labelY = boxMargin + boxPadding + labelTextHeight / 2;

    const boxWidth = labelRect.width - 2 * boxMargin;
    const maxLabelWidth = boxWidth - 2 * boxPadding;

    const dataGroupCenter = this.trackRect.left + dataRect.left
      + dataRect.width / 2 - this.groupTranslateX;

    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    this.ctx.font = this.constructionSettings.labelFont;
    this.setLineSettings(labelBorderWidth, labelBorderColor);

    for (const { y, shift, lines } of labels) {
      if (y < this.yMin || y > this.yMax) continue;
      const boxHeight = lines.length * labelTextHeight + 2 * boxPadding;
      if (boxY + boxHeight > labelRect.height) break;

      this.ctx.beginPath();
      this.ctx.moveTo(dataGroupCenter + shift, (y - this.yMin) * scaleY);
      this.ctx.lineTo(0, labelY);
      this.ctx.lineTo(boxMargin, labelY);
      this.ctx.stroke();

      this.ctx.strokeRect(boxMargin, boxY, boxWidth, boxHeight);
      this.ctx.fillStyle = labelBackground;
      this.ctx.fillRect(boxMargin, boxY, boxWidth, boxHeight);
      this.ctx.fillStyle = labelColor;

      for (let i = 0; i < lines.length; i++) {
        const y = labelY + i * labelTextHeight
        this.ctx.fillText(lines[i], boxMargin + boxPadding, y, maxLabelWidth);
      }

      boxY += boxHeight + boxMargin;
      labelY += boxHeight + boxMargin;
    }
  }

  /** Отрисовка каротажных кривых. */
  public drawCurves(elements: CaratCurveModel[]): void {
    const ratio = CaratDrawer.ratio;
    const scaleY = window.devicePixelRatio * this.scale;

    const translateX = ratio * this.columnTranslateX;
    const translateY = ratio * (this.columnTranslateY - scaleY * this.yMin);
    const matrix = new DOMMatrix([1, 0, 0, scaleY * ratio, translateX, translateY]);

    this.ctx.resetTransform();
    this.ctx.lineJoin = 'round';

    for (const element of elements) {
      let thickness = element.style.thickness;
      if (element.active) thickness *= 2;
      this.setLineSettings(ratio * thickness, element.style.color);

      const path = new Path2D();
      matrix.a = ratio * (this.columnWidth / (element.axisMax - element.axisMin));
      matrix.e = translateX - element.axisMin * matrix.a;
      path.addPath(element.path, matrix);
      this.ctx.stroke(path);
    }
    this.ctx.restore();
  }

  /** Отрисовка корреляций между треками. */
  public drawCorrelations(correlations: CaratCorrelation, showDistance: boolean, image?: boolean): void {
    const { rect, leftViewport, rightViewport, distanceLabel } = correlations;
    const { top, left, width, height } = rect;

    const trackPadding = this.trackBodySettings.padding;
    const leftScaleY = window.devicePixelRatio * leftViewport.scale;
    const rightScaleY = window.devicePixelRatio * rightViewport.scale;

    this.setTranslate(left, top);
    this.ctx.lineWidth = this.correlationSettings.thickness;
    this.ctx.clearRect(0, 0, width, height);

    if (!image) {
      this.ctx.save();
      this.ctx.rect(0, 0, width, height);
      this.ctx.clip();
    }
    for (const correlation of correlations.data) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, leftScaleY * (correlation.leftBottom - leftViewport.y));
      this.ctx.lineTo(0, leftScaleY * (correlation.leftTop - leftViewport.y));
      this.ctx.lineTo(width, rightScaleY * (correlation.rightTop - rightViewport.y));
      this.ctx.lineTo(width, rightScaleY * (correlation.rightBottom - rightViewport.y));
      this.ctx.closePath();

      this.ctx.fillStyle = correlation.style.fill;
      this.ctx.strokeStyle = correlation.style.stroke;
      this.ctx.fill(); this.ctx.stroke();
    }
    if (image) {
      this.ctx.clearRect(0, -top, width, top);
      this.ctx.clearRect(-1, -top, width + 2, trackPadding);
      this.ctx.clearRect(-1, height, width + 2, trackPadding);
    } else {
      this.ctx.restore();
    }
    if (showDistance && distanceLabel) this.drawCorrelationDistance(rect, distanceLabel);
  }

  private drawCorrelationDistance(rect: Rectangle, label: string): void {
    const arrowHalfSize = 4;
    const { labelFont, labelColor, labelHeight } = this.correlationSettings;

    const width = rect.width;
    const height = labelHeight + 2 * arrowHalfSize;

    this.setTranslate(rect.left, rect.top - height - arrowHalfSize);
    this.ctx.clearRect(0, 0, width, height);

    this.ctx.strokeStyle = labelColor;
    this.ctx.fillStyle = labelColor;
    this.ctx.lineWidth = this.correlationSettings.thickness;

    const arrowBaseline = labelHeight + arrowHalfSize;
    this.ctx.beginPath();
    this.ctx.moveTo(0, arrowBaseline);
    this.ctx.lineTo(width, arrowBaseline);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(0, arrowBaseline);
    this.ctx.lineTo(arrowHalfSize, arrowBaseline + arrowHalfSize);
    this.ctx.lineTo(arrowHalfSize, arrowBaseline - arrowHalfSize);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.moveTo(width, arrowBaseline);
    this.ctx.lineTo(width - arrowHalfSize, arrowBaseline + arrowHalfSize);
    this.ctx.lineTo(width - arrowHalfSize, arrowBaseline - arrowHalfSize);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.font = labelFont;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(label, width / 2, 0, width);
  }
}
