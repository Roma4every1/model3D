import { cartesianProduct, fixColorHEX } from 'shared/lib';
import { parseColorHEX, fillPatterns, overlayColor, stringifyRGBA } from 'shared/drawing';
import { defaultSettings } from './constants';


/** Информация о справочнике цветов и текста пропластков. */
export interface CaratStyleLookup {
  /** Название колонки, откуда берётся значение. */
  columnName: string;
  /** Название справочника. */
  channelID: ChannelID;
  /** Информация о свойствах справочника. */
  info: ChannelRecordInfo<keyof StyleModel | 'id'>;
}

/** Словарь моделей стилей по кодам справочника. */
type StyleLookupDict = Record<string, StyleModel>;

/** Набор данных для построения стиля интервального элемента. */
interface StyleModel {
  /** Второй цвет заливки. */
  color: RGBA;
  /** Цвет границы. */
  borderColor: RGBA;
  /** Фон заливки. */
  backgroundColor: RGBA;
  /** Идентификатор стиля заливки. */
  fillStyle?: string;
}


export class IntervalStyleManager {
  private readonly styles: CaratStyleLookup[];
  private styleDict: Record<string, ShapeStyle>;

  constructor(styles: CaratStyleLookup[]) {
    this.styles = styles;
    this.styleDict = {};
  }

  public clone(): IntervalStyleManager {
    const clone = new IntervalStyleManager(this.styles);
    clone.styleDict = this.styleDict;
    return clone;
  }

  public getLookups(): ChannelID[] {
    return this.styles.map(s => s.channelID);
  }

  public getStyle(record: ChannelRecord): ShapeStyle {
    const styleID = this.styles.map(s => record[s.columnName]).join('&')
    return this.styleDict[styleID] ?? defaultSettings.intervalStyle;
  }

  public setLookupData(lookupData: ChannelRecordDict): void {
    if (this.styles.length === 0) return;
    this.styleDict = {};

    const colors = this.styles.map((style: CaratStyleLookup): StyleLookupDict => {
      const records = lookupData[style.channelID];
      return this.createDict(style, records);
    });
    if (colors.length === 1) {
      const entries = Object.entries(colors[0]);
      for (const [key, value] of entries) this.styleDict[key] = this.createStyle(value);
      return;
    }
    const possibleValues: string[][] = cartesianProduct(...colors.map(Object.keys));

    for (const values of possibleValues) {
      const transparent: RGBA = [0, 0, 0, 0];
      let xColor = transparent;
      let xBorderColor = transparent;
      let xBackgroundColor = transparent;
      let xFillStyle: string = undefined;

      for (let i = 0; i < values.length; i++) {
        const { color, backgroundColor, borderColor, fillStyle } = colors[i][values[i]];
        if (color) xColor = overlayColor(xColor, color);
        if (borderColor) xBorderColor = overlayColor(xBorderColor, borderColor);
        if (backgroundColor) xBackgroundColor = overlayColor(xBackgroundColor, backgroundColor);
        if (fillStyle) xFillStyle = fillStyle;
      }

      const style: StyleModel = {
        color: xColor, borderColor: xBorderColor,
        backgroundColor: xBackgroundColor, fillStyle: xFillStyle,
      };
      this.styleDict[values.join('&')] = this.createStyle(style);
    }
  }

  private createStyle(model: StyleModel): ShapeStyle {
    const style: ShapeStyle = {fill: undefined, stroke: undefined};
    const background = model.backgroundColor ? stringifyRGBA(model.backgroundColor) : undefined;

    if (model.fillStyle) {
      const color = model.color ? stringifyRGBA(model.color) : undefined;
      style.fill = fillPatterns.createFillStyle(model.fillStyle, color, background);
    } else {
      style.fill = background;
    }
    if (model.borderColor) {
      style.stroke = stringifyRGBA(model.borderColor);
    }
    return style;
  }

  private createDict(style: CaratStyleLookup, records: ChannelRecord[]): StyleLookupDict {
    const dict: StyleLookupDict = {};
    const info = style.info;

    for (const record of records) {
      const id = record[info.id.columnName];
      const fillStyle = record[info.fillStyle.columnName];

      const color = parseColorHEX(fixColorHEX(record[info.color.columnName]));
      const borderColor = parseColorHEX(fixColorHEX(record[info.borderColor.columnName]));
      const backgroundColor = parseColorHEX(fixColorHEX(record[info.backgroundColor.columnName]));

      dict[id] = {color, borderColor, backgroundColor, fillStyle};
    }
    return dict;
  }
}
