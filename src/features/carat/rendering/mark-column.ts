import type { CaratMarkModel, CaratMarkSettingsDTO, CaratMarkSettings } from '../lib/mark.types';
import { CaratDrawer } from './drawer';
import { measureText, splitByWidth } from 'shared/drawing';
import { parseHorizontalAlign, parseDashArray } from 'shared/drawing';
import { defaultMarkSettings, drawerConfig } from '../lib/constants';


/** Колонка отображающая подписи по глубине. */
export class CaratMarkColumn implements ICaratColumn {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник колонки. */
  public readonly rect: Rectangle;
  /** Массив подключённых свойств канала. */
  public readonly channel: AttachedChannel;
  /** Является ли колонка видимой. */
  public visible: boolean;

  /** Элементы колонки. */
  private elements: CaratMarkModel[];
  /** Настройки отображения подписей по глубине. */
  private readonly markSettings: CaratMarkSettings;

  /** Минимальная ширина колонки, при которой отрисовка имеет смысл. */
  private minRenderWidth: number;
  /** Максимально допустимая ширина линии подписи. */
  private maxTextWidth: number;

  constructor(
    rect: Rectangle, drawer: CaratDrawer,
    channel: AttachedChannel, settings: CaratMarkSettingsDTO,
  ) {
    this.drawer = drawer;
    this.rect = rect;
    this.channel = channel;
    this.visible = true;
    this.elements = [];
    this.markSettings = this.createSettings(settings);
    this.updateBounds();
  }

  private createSettings(dto: CaratMarkSettingsDTO): CaratMarkSettings {
    if (!dto) dto = defaultMarkSettings;
    const text = dto.text ? {...defaultMarkSettings.text, ...dto.text} : defaultMarkSettings.text;
    const line = dto.line ? {...defaultMarkSettings.line, ...dto.line} : defaultMarkSettings.line;

    let borderColor = text.borderColor;
    if (borderColor === 'none') borderColor = null;
    let backgroundColor = text.backgroundColor;
    if (backgroundColor === 'none') backgroundColor = null;

    let fontSize = text.fontSize;
    if (fontSize < 8) fontSize = 8;
    if (fontSize > 16) fontSize = 16;
    const font = `normal ${fontSize}px ${drawerConfig.stage.font.family}`;

    return {
      text: {
        align: text.align as CanvasTextAlign, nAlign: parseHorizontalAlign(text.align),
        color: text.color, backgroundColor, borderColor, font, fontSize,
      },
      line: {
        dasharray: parseDashArray(line.dasharray),
        color: line.color, width: line.width,
      },
      showLine: dto.showLine ?? defaultMarkSettings.showLine,
      showDepth: dto.showDepth ?? defaultMarkSettings.showDepth,
      depthTextWidth: measureText('0000', font),
    };
  }

  public updateBounds(): void {
    const font = this.markSettings.text.font;
    const { padding, gap } = this.drawer.markSettings;

    this.minRenderWidth = measureText('xxx', font) + 2 * padding;
    this.maxTextWidth = this.rect.width - 2 * padding;

    if (this.markSettings.showDepth) {
      let total = this.markSettings.depthTextWidth + gap;
      if (this.markSettings.text.nAlign === 0) total *= 2;
      this.minRenderWidth += total;
      this.maxTextWidth -= total;
    }
    this.elements.forEach(mark => this.updateMarkLines(mark));
  }

  public copy(): CaratMarkColumn {
    const copy: CaratMarkColumn = {...this, elements: []};
    Object.setPrototypeOf(copy, CaratMarkColumn.prototype);
    return copy;
  }

  public getRange(): [number, number] {
    let min = Infinity;
    let max = -Infinity;

    for (const { depth } of this.elements) {
      if (depth < min) min = depth;
      if (depth > max) max = depth;
    }
    return [min, max];
  }

  public getLookups(): ChannelID[] {
    return [];
  }

  public getElements(): CaratMarkModel[] {
    return this.elements;
  }

  public setChannelData(records: ChannelRecord[]): void {
    const depthColumnName = this.channel.info.depth.columnName;
    const textColumnName = this.channel.info.text.columnName;

    this.elements = records.map((record: ChannelRecord): CaratMarkModel => {
      const text: string = record[textColumnName];
      const depth: number = record[depthColumnName];
      const depthText = Math.round(depth).toString();

      const mark: CaratMarkModel = {depth, depthText, text, lines: null, maxLineWidth: null};
      this.updateMarkLines(mark);
      return mark;
    });
  }

  private updateMarkLines(mark: CaratMarkModel): void {
    const text = mark.text;
    const font = this.markSettings.text.font;

    let lines = [text];
    let maxLineWidth = measureText(text, font);

    if (maxLineWidth > this.maxTextWidth) {
      lines = splitByWidth(text, font, this.maxTextWidth);
      maxLineWidth = 0;

      for (const line of lines) {
        const lineWidth = measureText(line, font);
        if (lineWidth > maxLineWidth) maxLineWidth = lineWidth;
      }
    }
    mark.lines = lines;
    mark.maxLineWidth = Math.min(maxLineWidth, this.maxTextWidth);
  }

  public setLookupData(): void {
    // все настройки внешнего вида хранятся в сессии
  }

  public render(): void {
    if (this.rect.width < this.minRenderWidth) return;
    this.drawer.setCurrentColumn(this.rect);
    this.drawer.drawMarks(this.elements, this.markSettings, this.maxTextWidth);
    this.drawer.restore();
  }
}
