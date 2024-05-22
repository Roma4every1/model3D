import type { CaratWellFaceModel } from '../lib/construction.types';
import { CaratDrawer } from './drawer';
import { fixColorHEX } from 'shared/lib';


/** Колонка отображающая элементы типа "забой скважины". */
export class WellFaceColumn implements ICaratColumn {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник колонки. */
  public readonly rect: Rectangle;
  /** Массив подключённых свойств канала. */
  public readonly channel: AttachedChannel;
  /** Является ли колонка видимой. */
  public visible: boolean;

  /** Забои. */
  private elements: CaratWellFaceModel[];
  /** Словарь свойств внешнего вида забоев. */
  private styleDict: Record<string, ShapeStyle>;

  constructor(rect: Rectangle, drawer: CaratDrawer, channel: AttachedChannel) {
    this.drawer = drawer;
    this.rect = rect;
    this.channel = channel;
    this.visible = true;
    this.elements = [];
    this.styleDict = {};
  }

  public copy(): ICaratColumn {
    const copy = new WellFaceColumn({...this.rect}, this.drawer, this.channel);
    copy.styleDict = this.styleDict;
    copy.visible = this.visible;
    return copy;
  }

  public getLookupNames(): ChannelName[] {
    const lookup = this.channel.info.type.lookups.style;
    return lookup ? [lookup.name] : [];
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
      const style = this.styleDict[record[info.type.columnName]];
      if (!style) continue;
      const top = record[info.top.columnName];
      const bottom = record[info.bottom.columnName];
      const diameter = record[info.diameter.columnName];
      const label = record[info.label.columnName];
      this.elements.push({top, bottom, diameter, style, label});
    }
  }

  public setLookupData(lookupData: ChannelRecordDict): void {
    const lookup = this.channel.info.type.lookups.style;
    if (!lookup) return;

    this.styleDict = {};
    const records = lookupData[lookup.name];

    for (const record of records) {
      const id = record[lookup.info.id.columnName];
      const fill = fixColorHEX(record[lookup.info.backgroundColor.columnName]);
      const stroke = fixColorHEX(record[lookup.info.color.columnName]);
      this.styleDict[id] = {fill, stroke};
    }
  }

  public render(): void {
    this.drawer.setCurrentColumn(this.rect);
    this.drawer.drawWellFaces(this.elements);
    this.drawer.restore();
  }
}
