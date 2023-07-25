import { CaratDrawer } from './drawer';
import { CaratBarModel, CaratIntervalModel, CaratIntervalStyleDict } from '../lib/types';
import { cartesianProduct } from 'shared/lib';
import { fillPatterns, parseColorHEX, stringifyRGBA, overlayColor } from 'shared/drawing';
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
    this.barStyle = null;
    this.textStyle = null;
  }

  public copy(): CaratColumn {
    const copy = new CaratColumn(this.rect, this.drawer, this.channel, this.properties);
    copy.styleDict = this.styleDict;
    copy.barStyle = this.barStyle;
    copy.textStyle = this.textStyle;
    return copy;
  }

  public getLookupNames(): ChannelName[] {
    const names: ChannelName[] = [];
    for (const { color, text } of this.channel.styles) {
      if (color.name) names.push(color.name);
      if (text.name) names.push(text.name);
    }
    return names;
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

  public setChannelData(records: ChannelRecord[]) {
    const info = this.channel.info as CaratLithologyInfo;
    const barProperty = this.channel.properties.find(p => this.properties[p.name]?.showBar);

    let textProperty: ChannelProperty;
    if (barProperty) {
      if (this.properties[barProperty.name].showText) textProperty = barProperty;
    } else {
      textProperty = this.channel.properties.find(p => this.properties[p.name]?.showText);
    }

    this.barStyle = barProperty ? this.properties[barProperty.name].bar : null;
    this.textStyle = textProperty ? this.properties[textProperty.name].text : null;

    this.intervals = [];
    this.bars = [];

    if (barProperty) {
      this.barStyle = this.properties[barProperty.name].bar;
      const barColumnName = info.bar.name;
      const max = Math.max(...records.map(row => row[barColumnName]));

      this.bars = records.map((record): CaratBarModel => {
        const barValue = record[barColumnName];
        const value = barValue / max;
        const text = (this.textStyle && barValue) ? barValue.toString() : undefined;
        return {top: record[info.top.name], bottom: record[info.bottom.name], value, text};
      });
    } else {
      const styles = this.channel.styles;
      const textDict = styles.at(-1)?.text.dict;
      const textColumnName = styles.at(-1)?.columnName;
      const styleColumnNames = styles.map((style) => style.columnName);

      this.intervals = records.map((record): CaratIntervalModel => {
        const stratumID = info.stratumID ? record[info.stratumID.name] : undefined;
        const top = record[info.top.name];
        const bottom = record[info.bottom.name];

        const styleID = styleColumnNames.map(name => record[name]).join('&');
        const style = this.styleDict[styleID] ?? defaultSettings.intervalStyle as any;

        let text = this.textStyle ? record[textColumnName] : undefined;
        if (textDict && text !== undefined) text = textDict[text];
        return {stratumID, top, bottom, styleID, style, text};
      });
    }
  }

  public setLookupData(lookupData: ChannelRecordDict) {
    for (const { color: colorLookup, text: textLookup } of this.channel.styles) {
      const colorRecords = lookupData[colorLookup.name];
      colorLookup.dict = {};

      const textRecords = lookupData[textLookup.name];
      textLookup.dict = {};

      if (colorRecords) {
        const info = colorLookup.info;
        for (const record of colorRecords) {
          colorLookup.dict[record[info.id.name]] = {
            color: parseColorHEX(fixHEX(record[info.color.name])),
            borderColor: parseColorHEX(fixHEX(record[info.borderColor.name])),
            backgroundColor: parseColorHEX(fixHEX(record[info.backgroundColor.name])),
            fillStyle: record[info.fillStyle.name],
            lineStyle: record[info.lineStyle.name],
          };
        }
      }
      if (textRecords) {
        const idName = textLookup.info.id.name;
        const valueName = textLookup.info.value.name;
        for (const record of textRecords) {
          const id = record[idName];
          textLookup.dict[id] = record[valueName];
        }
      }
    }
    this.updateStyleDict();
    for (const element of this.intervals) {
      element.style = this.styleDict[element.styleID] ?? defaultSettings.intervalStyle as any;
    }
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

      if (style.fillStyle) {
        style.fill = fillPatterns.createFillStyle(style.fillStyle, style.color, style.backgroundColor);
      } else {
        style.fill = style.backgroundColor;
      }
      style.stroke = style.borderColor;
    }
  }

  public render() {
    this.drawer.setCurrentColumn(this.rect, this.barStyle, this.textStyle);
    if (this.intervals.length) this.drawer.drawIntervals(this.intervals);
    if (this.bars.length) this.drawer.drawBars(this.bars);
    this.drawer.restore();
  }
}
