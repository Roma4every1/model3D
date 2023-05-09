import { CaratDrawer } from './drawer';
import { CaratBarModel, CaratIntervalModel, CaratIntervalStyleDict } from '../lib/types';
import { applyInfoIndexes, createInfoRecord } from '../lib/channels';
import { defaultSettings } from '../lib/constants';


/** Колонка каротажной диаграммы. */
export class CaratColumn implements ICaratColumn {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник колонки. */
  public readonly rect: Rectangle;
  /** Массив подключённых свойств канала. */
  public readonly channel: CaratAttachedChannel;
  /** Словарь настроек отображения свойств. */
  private readonly properties: CaratColumnProperties;

  /** Пласты. */
  private intervals: CaratIntervalModel[];
  /** Гистограммы */
  private bars: CaratBarModel[];

  /** Словарь свойств внешнего вида пластов. */
  private styleDict: CaratIntervalStyleDict;
  /** Словарь подписей пластов. */
  private textDict: Record<number | string, string>;

  /** Стиль гистограмм. */
  private barStyle: CaratBarPropertySettings | null;
  /** Стиль подписей. */
  private textStyle: CaratTextPropertySettings | null;

  constructor(
    rect: Rectangle, drawer: CaratDrawer,
    channel: CaratAttachedChannel, properties: CaratColumnProperties
  ) {
    this.rect = rect;
    this.drawer = drawer;
    this.channel = channel;
    this.properties = properties;

    this.intervals = [];
    this.bars = [];
    this.styleDict = {};
    this.textDict = {};
    this.barStyle = null;
    this.textStyle = null;
  }

  public getElements(): any[] {
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

  public setChannelData(data: ChannelData) {
    const info = this.channel.info as CaratLithologyInfo;
    const barProperty = this.channel.properties.find(p => this.properties[p.name]?.showBar);

    let textProperty: ChannelProperty;
    if (barProperty && this.properties[barProperty.name].showText) {
      textProperty = barProperty;
    } else {
      textProperty = this.channel.properties.find(p => this.properties[p.name]?.showText);
    }

    if (barProperty) {
      if (!info.bar) {
        info.bar = {name: barProperty.fromColumn, index: -1};
        this.channel.applied = false;
      }
      this.barStyle = this.properties[barProperty.name].bar;
    } else {
      delete info.bar;
      this.barStyle = null;
    }
    if (textProperty) {
      if (!info.text) {
        info.text = {name: textProperty.fromColumn, index: -1};
        this.channel.applied = false;
      }
      this.textStyle = this.properties[textProperty.name].text;
    } else {
      delete info.text;
      this.textStyle = null;
    }

    this.intervals = [];
    this.bars = [];
    const rows = data?.rows ?? [];

    if (data?.columns && !this.channel.applied) applyInfoIndexes(this.channel, data.columns);
    const topIndex = info.top.index;
    const bottomIndex = info.bottom.index;

    if (barProperty) {
      this.barStyle = this.properties[barProperty.name].bar;
      const barIndex = info.bar.index;
      const max = Math.max(...rows.map(row => row.Cells[barIndex]));

      this.bars = rows.map((row): CaratBarModel => {
        const cells = row.Cells;
        const value = cells[barIndex] / max;
        const text = cells[info.text?.index]?.toString();
        return {top: cells[topIndex], bottom: cells[bottomIndex], value, text};
      });
    } else {
      const stratumIndex = info.stratumID?.index ?? -1;
      const styleIndex = info.style?.index;
      const textIndex = info.text?.index ?? -1;

      this.intervals = rows.map((row): CaratIntervalModel => {
        const cells = row.Cells;
        const stratumID = stratumIndex > 0 ? cells[stratumIndex] : undefined;
        const style = this.styleDict[cells[styleIndex]] ?? defaultSettings.intervalStyle as any;

        let text = textIndex > 0 ? cells[textIndex] : undefined;
        if (this.channel.text && text !== undefined) text = this.textDict[text];
        return {stratumID, top: cells[topIndex], bottom: cells[bottomIndex], style, text};
      });
    }
  }

  public setLookupData(lookupData: ChannelDict) {
    const styleLookup = this.channel.style;
    const textLookup = this.channel.text;
    const styleChannel = lookupData[styleLookup?.name];
    const textChannel = lookupData[textLookup?.name];

    this.styleDict = {};
    this.textDict = {};
    const styleRows = styleChannel?.data?.rows;
    const textRows = textChannel?.data.rows;

    if (styleRows) {
      if (!styleLookup.applied) applyInfoIndexes(styleLookup, styleChannel.data.columns);
      const info = styleLookup.info;

      for (const row of styleRows) {
        const { id, color, borderColor, backgroundColor, fillStyle } = createInfoRecord(row, info);
        const style = {fill: backgroundColor, stroke: borderColor};

        if (fillStyle) this.drawer.getPattern(fillStyle, color, backgroundColor)
            .then((pattern) => { if (pattern) style.fill = pattern; });
        this.styleDict[id] = style;
      }
    }
    if (textRows) {
      if (!textLookup.applied) applyInfoIndexes(textLookup, textChannel.data.columns);
      const info = textLookup.info;

      for (const row of textRows) {
        const { id, value } = createInfoRecord(row, info);
        this.textDict[id] = value;
      }
    }
  }

  public render() {
    this.drawer.setCurrentColumn(this.rect, this.barStyle, this.textStyle);
    if (this.intervals.length) this.drawer.drawIntervals(this.intervals);
    if (this.bars.length) this.drawer.drawBars(this.bars);
    this.drawer.restore();
  }
}
