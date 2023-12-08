import { CaratDrawer } from './drawer.ts';
import { CaratWellFaceModel } from '../lib/types.ts';


/** Колонка отображающая элементы типа "забой скважины". */
export class WellFaceColumn implements ICaratColumn {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник колонки. */
  public readonly rect: Rectangle;
  /** Массив подключённых свойств канала. */
  public readonly channel: CaratAttachedChannel;

  private elements: CaratWellFaceModel[];

  constructor(rect: Rectangle, drawer: CaratDrawer, channel: CaratAttachedChannel) {
    this.drawer = drawer;
    this.rect = rect;
    this.channel = channel;
    this.elements = [];
  }

  public copy(): ICaratColumn {
    return new WellFaceColumn({...this.rect}, this.drawer, this.channel);
  }

  public getLookupNames(): ChannelName[] {
    return [];
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
      const top = record[info.top.name];
      const bottom = record[info.bottom.name];
      const diameter = record[info.diameter.name];
      const type = record[info.type.name];
      const date = record[info.date.name];
      const label = record[info.label.name];
      this.elements.push({top, bottom, diameter, type, date, label});
    }
  }

  public setLookupData(lookupData: ChannelRecordDict): void {
    // пока ничего не нужно
  }

  public render(): void {
    this.drawer.setCurrentColumn(this.rect);
    this.drawer.drawWellFaces(this.elements);
    this.drawer.restore();
  }
}
