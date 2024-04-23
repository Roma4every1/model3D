import { CaratDrawer } from './drawer';
import { CaratIntervalStyleDict, CaratWellFaceModel } from '../lib/types';
import { fixColorHEX } from 'shared/lib';


/** Колонка отображающая элементы типа "забой скважины". */
export class WellFaceColumn implements ICaratColumn {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник колонки. */
  public readonly rect: Rectangle;
  /** Массив подключённых свойств канала. */
  public readonly channel: CaratAttachedChannel;

  /** Забои. */
  private elements: CaratWellFaceModel[];
  /** Словарь свойств внешнего вида забоев. */
  private styleDict: CaratIntervalStyleDict;

  constructor(rect: Rectangle, drawer: CaratDrawer, channel: CaratAttachedChannel) {
    this.drawer = drawer;
    this.rect = rect;
    this.channel = channel;
    this.elements = [];
    this.styleDict = {};
  }

  public copy(): ICaratColumn {
    const copy = new WellFaceColumn({...this.rect}, this.drawer, this.channel);
    copy.styleDict = this.styleDict;
    return copy;
  }

  public getLookupNames(): ChannelName[] {
    const lookup = this.channel.styles[0].color;
    return [lookup.name];
  }

  public getElements(): any[] {
    return this.elements;
  }

  public getRange(): [number, number] {
    let min = Infinity;
    let max = -Infinity;

    for (const { top, bottom } of this.elements) {
      if (top < min) min = top;
      if (bottom > max) max = bottom;
    }
    return [min, max];
  }

  public setChannelData(records: ChannelRecord[]): void {
    this.elements = [];
    const info = this.channel.info;

    for (const record of records) {
      const style = this.styleDict[record[info.type.name]];
      if (!style) continue;
      const top = record[info.top.name];
      const bottom = record[info.bottom.name];
      const diameter = record[info.diameter.name];
      const label = record[info.label.name];
      this.elements.push({top, bottom, diameter, style, label});
    }
  }

  public setLookupData(lookupData: ChannelRecordDict): void {
    const lookup = this.channel.styles[0].color;
    const records = lookupData[lookup.name];
    this.styleDict = {};

    for (const record of records) {
      const id = record[lookup.info.id.name];
      const fill = fixColorHEX(record[lookup.info.backgroundColor.name]);
      const stroke = fixColorHEX(record[lookup.info.color.name]);
      this.styleDict[id] = {fill, stroke};
    }
  }

  public render(): void {
    this.drawer.setCurrentColumn(this.rect);
    this.drawer.drawWellFaces(this.elements);
    this.drawer.restore();
  }
}
