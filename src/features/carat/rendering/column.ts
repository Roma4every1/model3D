import { CaratDrawer } from './drawer';
import { CaratBarModel, CaratIntervalModel, CaratIntervalStyleDict } from '../lib/types';
import { cartesianProduct, parseColorHEX, stringifyRGBA, overlayColor } from 'shared/lib';
import { applyInfoIndexes, createInfoRecord } from '../lib/channels';
import { fixHEX } from '../lib/utils';
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
    if (barProperty) {
      if (this.properties[barProperty.name].showText) textProperty = barProperty;
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
      this.textStyle = this.properties[textProperty.name].text;
    } else {
      this.textStyle = null;
    }

    this.intervals = [];
    this.bars = [];
    const rows = data?.rows ?? [];

    if (data?.columns && !this.channel.applied) {
      applyInfoIndexes(this.channel, data.columns);
      data.columns.forEach(({ Name: name }, i) => {
        for (const style of this.channel.styles) {
          if (style.columnName === name) style.columnIndex = i;
        }
      });
      this.channel.styles = this.channel.styles.filter((style) => style.columnIndex >= 0);
    }

    const topIndex = info.top.index;
    const bottomIndex = info.bottom.index;

    if (barProperty) {
      this.barStyle = this.properties[barProperty.name].bar;
      const barIndex = info.bar.index;
      const max = Math.max(...rows.map(row => row.Cells[barIndex]));

      this.bars = rows.map((row): CaratBarModel => {
        const cells = row.Cells;
        const barValue = cells[barIndex];
        const text = (this.textStyle && barValue) ? barValue.toString() : undefined;
        return {top: cells[topIndex], bottom: cells[bottomIndex], value: barValue / max, text};
      });
    } else {
      const stratumIndex = info.stratumID?.index ?? -1;
      const styles = this.channel.styles;
      const textDict = styles.at(-1)?.text.dict;
      const textIndex = styles.at(-1)?.columnIndex ?? -1;
      const styleIndexes = styles.map((style) => style.columnIndex);

      this.intervals = rows.map((row): CaratIntervalModel => {
        const cells = row.Cells;
        const stratumID = stratumIndex > 0 ? cells[stratumIndex] : undefined;

        const styleID = styleIndexes.map(i => cells[i]).join('&');
        const style = this.styleDict[styleID] ?? defaultSettings.intervalStyle as any;

        let text = (this.textStyle && textIndex > 0) ? cells[textIndex] : undefined;
        if (textDict && text !== undefined) text = textDict[text];
        return {stratumID, top: cells[topIndex], bottom: cells[bottomIndex], style, text};
      });
    }
  }

  public setLookupData(lookupData: ChannelDict) {
    for (const { color: colorLookup, text: textLookup } of this.channel.styles) {
      const colorChannel = lookupData[colorLookup.name];
      const colorRows = colorChannel?.data?.rows;
      colorLookup.dict = {};

      const textChannel = lookupData[textLookup.name];
      const textRows = textChannel?.data?.rows;
      textLookup.dict = {};

      if (colorRows) {
        if (!colorLookup.applied) applyInfoIndexes(colorLookup, colorChannel.data.columns);
        const info = colorLookup.info;

        for (const row of colorRows) {
          const style = createInfoRecord(row, info);
          style.color = parseColorHEX(fixHEX(style.color));
          style.borderColor = parseColorHEX(fixHEX(style.borderColor));
          style.backgroundColor = parseColorHEX(fixHEX(style.backgroundColor));
          colorLookup.dict[style.id] = style;
        }
      }
      if (textRows) {
        if (!textLookup.applied) applyInfoIndexes(textLookup, textChannel.data.columns);
        const info = textLookup.info;

        for (const row of textRows) {
          const { id, value } = createInfoRecord(row, info);
          textLookup.dict[id] = value;
        }
      }
    }
    this.updateStyleDict();
  }

  private updateStyleDict() {
    this.styleDict = {};
    const styles = this.channel.styles;

    if (styles.length > 1) {
      const colors = styles.map((style) => style.color.dict);
      const possibleValues = cartesianProduct(...colors.map(Object.keys));

      for (const values of possibleValues) {
        const transparent: ColorModelRGBA = [0, 0, 0, 0];
        const style = {
          color: transparent, borderColor: transparent,
          backgroundColor: transparent, fillStyle: null,
        };

        for (let i = 0; i < values.length; i++) {
          const { color, backgroundColor, borderColor, fillStyle } = colors[i][values[i]];
          if (color) style.color = overlayColor(style.color, color);
          if (borderColor) style.borderColor = overlayColor(style.borderColor, borderColor);
          if (backgroundColor) style.backgroundColor = overlayColor(style.backgroundColor, backgroundColor);
          if (fillStyle) style.fillStyle = fillStyle;
        }
        this.styleDict[values.join('&')] = style;
      }
    } else if (styles.length) {
      this.styleDict = styles[0].color.dict;
    }

    for (const key in this.styleDict) {
      const style = this.styleDict[key] as any;
      if (style.color) style.color = stringifyRGBA(style.color);
      if (style.borderColor) style.borderColor = stringifyRGBA(style.borderColor);
      if (style.backgroundColor) style.backgroundColor = stringifyRGBA(style.backgroundColor);
      style.stroke = style.borderColor;
      style.fill = style.backgroundColor;

      if (style.fillStyle) this.drawer.getPattern(style.fillStyle, style.color, style.backgroundColor)
        .then((pattern) => { if (pattern) style.fill = pattern; });
    }
  }

  public render() {
    this.drawer.setCurrentColumn(this.rect, this.barStyle, this.textStyle);
    if (this.intervals.length) this.drawer.drawIntervals(this.intervals);
    if (this.bars.length) this.drawer.drawBars(this.bars);
    this.drawer.restore();
  }
}
