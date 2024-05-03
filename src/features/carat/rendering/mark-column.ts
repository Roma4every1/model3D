import type { CaratMarkModel, CaratMarkSettingsDTO, CaratMarkSettings } from '../lib/mark.types';
import { CaratDrawer } from './drawer';
import { getMeasurerForFont } from 'shared/lib';
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

  private elements: CaratMarkModel[];
  private readonly markSettings: CaratMarkSettings;
  private readonly measurer: (text: string) => number;

  constructor(
    rect: Rectangle, drawer: CaratDrawer,
    channel: AttachedChannel, settings: CaratMarkSettingsDTO,
  ) {
    this.drawer = drawer;
    this.rect = rect;
    this.channel = channel;
    this.elements = [];
    this.markSettings = this.createSettings(settings);
    this.measurer = getMeasurerForFont(this.markSettings.text.font);
  }

  private createSettings(dto: CaratMarkSettingsDTO): CaratMarkSettings {
    if (!dto) dto = defaultMarkSettings;
    const text = dto.text ? {...defaultMarkSettings.text, ...dto.text} : defaultMarkSettings.text;
    const line = dto.line ? {...defaultMarkSettings.line, ...dto.line} : defaultMarkSettings.line;

    return {
      text: {
        align: text.align as CanvasTextAlign, nAlign: parseHorizontalAlign(text.align),
        color: text.color, backgroundColor: text.backgroundColor, borderColor: text.borderColor,
        font: `normal ${text.fontSize}px ${drawerConfig.stage.font.family}`, fontSize: text.fontSize,
      },
      line: {
        dasharray: parseDashArray(line.dasharray),
        color: line.color, width: line.width,
      },
      showLine: dto.showLine ?? defaultMarkSettings.showLine,
      showDepth: dto.showDepth ?? defaultMarkSettings.showDepth,
    };
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

  public getLookupNames(): ChannelName[] {
    return [];
  }

  public getElements(): any[] {
    return this.elements;
  }

  public setChannelData(records: ChannelRecord[]): void {
    const depthColumnName = this.channel.info.depth.columnName;
    const textColumnName = this.channel.info.text.columnName;

    this.elements = records.map((record: ChannelRecord): CaratMarkModel => {
      const text = record[textColumnName];
      const depth = record[depthColumnName];
      return {depth, text, textWidth: this.measurer(text)};
    });
  }

  public setLookupData(): void {
    // все настройки внешнего вида — константы сессии
  }

  public render(): void {
    this.drawer.setCurrentColumn(this.rect);
    this.drawer.drawMarks(this.elements, this.markSettings);
    this.drawer.restore();
  }
}
