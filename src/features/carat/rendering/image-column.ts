import type { CaratImageModel } from '../lib/construction.types';
import { CaratDrawer } from './drawer';


export class CaratImageColumn implements ICaratColumn {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник колонки. */
  public readonly rect: Rectangle;
  /** Массив подключённых свойств канала. */
  public readonly channel: AttachedChannel;
  /** Является ли колонка видимой. */
  public visible: boolean;

  private elements: CaratImageModel[];
  private imageDict: Record<number | string, HTMLImageElement>;

  constructor(rect: Rectangle, drawer: CaratDrawer, channel: AttachedChannel) {
    this.drawer = drawer;
    this.rect = rect;
    this.channel = channel;
    this.visible = true;
    this.elements = [];
    this.imageDict = {};
  }

  public copy(): CaratImageColumn {
    const copy = new CaratImageColumn({...this.rect}, this.drawer, this.channel);
    copy.imageDict = this.imageDict;
    copy.visible = this.visible;
    return copy;
  }

  public getLookups(): ChannelID[] {
    const imageLookupID = this.channel.info.imageID.lookups.image.id;
    return [imageLookupID];
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
      const id = record[info.imageID.columnName];
      const image = this.imageDict[id];
      if (!image) continue;
      const top = record[info.top.columnName];
      const bottom = record[info.bottom.columnName];
      const label = record[info.label.columnName];
      this.elements.push({top, bottom, image, label});
    }
  }

  public setLookupData(lookupData: ChannelRecordDict): void {
    this.imageDict = {};
    const { id: lookupID, info: lookupInfo } = this.channel.info.imageID.lookups.image;
    const records = lookupData[lookupID];

    for (const record of records) {
      const id = record[lookupInfo.id.columnName];
      const base64Str = record[lookupInfo.image.columnName];
      if (id === null || id === undefined || !base64Str) continue;

      const image = new Image();
      image.decoding = 'sync';
      image.src = 'data:image/png;base64,' + base64Str;
      this.imageDict[id] = image;
    }
  }

  public render(): void {
    this.drawer.setCurrentColumn(this.rect);
    this.drawer.drawImages(this.elements);
    this.drawer.restore();
  }
}
