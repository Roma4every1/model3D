import type { CaratBarModel, CaratIntervalModel} from '../lib/types';
import type { CaratColumnProperties, CaratTextPropertySettings, CaratBarPropertySettings } from '../lib/dto.types';
import { IntervalStyleManager } from '../lib/interval-style';
import { CaratDrawer } from './drawer';
import { round } from 'shared/lib';


/** Колонка каротажной диаграммы. */
export class CaratColumn implements ICaratColumn {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник колонки. */
  public readonly rect: Rectangle;
  /** Массив подключённых свойств канала. */
  public readonly channel: AttachedChannel;
  /** Является ли колонка видимой. */
  public visible: boolean;
  /** Словарь настроек отображения свойств. */
  private readonly properties: CaratColumnProperties;

  /** Пласты. */
  private intervals: CaratIntervalModel[];
  /** Гистограммы */
  private bars: CaratBarModel[];

  private textDict: Record<number, string>;
  private readonly textLookup: PropertyAttachedChannel;

  private readonly styleManager: IntervalStyleManager;
  private readonly barStyle: CaratBarPropertySettings | undefined;
  private readonly barProperty: ChannelProperty | undefined;
  private readonly textStyle: CaratTextPropertySettings | undefined;
  private readonly textProperty: ChannelProperty | undefined;

  constructor(
    rect: Rectangle, drawer: CaratDrawer,
    channel: AttachedChannel, properties: CaratColumnProperties
  ) {
    this.rect = rect;
    this.drawer = drawer;
    this.channel = channel;
    this.visible = true;
    this.properties = properties;

    this.intervals = [];
    this.bars = [];

    this.textDict = {};
    this.styleManager = new IntervalStyleManager(this.channel.config.styles);

    for (const property of channel.attachedProperties) {
      const propertySettings = properties[property.name];
      if (!propertySettings) continue;
      const { bar, showBar, text, showText } = propertySettings;

      if (!this.barProperty && bar && showBar) {
        this.barProperty = property;
        this.barStyle = bar;
      }
      if (!this.textProperty && text && showText) {
        this.textProperty = property;
        this.textStyle = text;
        this.textLookup = channel.info.stratumID?.lookups.name;
      }
    }
  }

  public copy(): CaratColumn {
    const styleManager = this.styleManager.clone();
    const copy: CaratColumn = {...this, rect: {...this.rect}, bars: [], intervals: [], styleManager};
    Object.setPrototypeOf(copy, CaratColumn.prototype);
    return copy;
  }

  public getLookups(): ChannelID[] {
    const ids = this.styleManager.getLookups();
    if (this.textLookup) ids.push(this.textLookup.id);
    return ids;
  }

  public getElements(): CaratIntervalModel[] {
    return this.intervals;
  }

  public getRange(): [number, number] {
    let min = Infinity;
    let max = -Infinity;

    for (const { top, bottom } of this.intervals) {
      if (top < min) min = top;
      if (bottom > max) max = bottom;
    }
    return [min, max];
  }

  public setChannelData(records: ChannelRecord[]): void {
    const info = this.channel.info;
    this.intervals = [];
    this.bars = [];

    if (this.barProperty) {
      const barColumnName = this.barProperty.fromColumn;
      const max = Math.max(...records.map(row => row[barColumnName]));

      this.bars = [];
      for (const record of records) {
        const top = record[info.top.columnName];
        const bottom = record[info.bottom.columnName];

        let barValue = record[barColumnName];
        if (top === null || bottom === null || barValue === null) continue;
        if (barValue < 0) barValue = 0;

        const text = this.textStyle ? round(barValue, 2).toString() : undefined;
        this.bars.push({top, bottom, value: barValue / max, text});
      }
    } else {
      let textColumnName: ColumnName;
      if (this.textProperty && this.textLookup) textColumnName = this.textProperty.fromColumn;

      this.intervals = records.map((record: ChannelRecord): CaratIntervalModel => {
        const stratumID = info.stratumID ? record[info.stratumID.columnName] : undefined;
        const top = record[info.top.columnName];
        const bottom = record[info.bottom.columnName];
        const style = this.styleManager.getStyle(record);
        const text = textColumnName ? this.textDict[record[textColumnName]] : undefined;
        return {stratumID, top, bottom, style, text};
      });
    }
  }

  public setLookupData(lookupData: ChannelRecordDict): void {
    this.styleManager.setLookupData(lookupData);
    if (!this.textLookup) return;

    this.textDict = {};
    const records = lookupData[this.textLookup.id];
    if (!records || records.length === 0) return;

    const idName = this.textLookup.info.id.columnName;
    const textName = this.textLookup.info.name.columnName;
    for (const record of records) this.textDict[record[idName]] = record[textName];
  }

  public render(): void {
    this.drawer.setCurrentColumn(this.rect, this.textStyle);
    if (this.intervals.length) this.drawer.drawIntervals(this.intervals);
    if (this.bars.length) this.drawer.drawBars(this.bars, this.barStyle);
    this.drawer.restore();
  }
}
