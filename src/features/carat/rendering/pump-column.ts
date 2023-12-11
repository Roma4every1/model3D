import { CaratDrawer } from './drawer';
import { CaratPumpModel } from '../lib/types';


export class PumpColumn implements ICaratColumn {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник колонки. */
  public readonly rect: Rectangle;
  /** Массив подключённых свойств канала. */
  public readonly channel: CaratAttachedChannel;

  private elements: CaratPumpModel[];
  private imageDict: Record<number, any>;

  constructor(rect: Rectangle, drawer: CaratDrawer, channel: CaratAttachedChannel) {
    this.drawer = drawer;
    this.rect = rect;
    this.channel = channel;
    this.elements = [];
    this.imageDict = {};
  }

  public copy(): ICaratColumn {
    const copy = new PumpColumn({...this.rect}, this.drawer, this.channel);
    copy.imageDict = this.imageDict;
    return copy;
  }

  public getLookupNames(): ChannelName[] {
    const imageLookupName = this.channel.imageLookup?.name;
    return imageLookupName ? [imageLookupName] : [];
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
      const pumpID = record[info.pumpID.name];
      const pumpImage = this.imageDict[pumpID];
      const top = record[info.top.name];
      const bottom = record[info.bottom.name];
      const label = record[info.label.name];
      this.elements.push({top, bottom, pumpID, pumpImage, label});
    }
  }

  public async setLookupData(lookupData: ChannelRecordDict): Promise<void> {
    this.imageDict = {};
    const lookupInfo = this.channel.imageLookup.info;
    const records = lookupData[this.channel.imageLookup.name];

    for (const record of records) {
      const id = record[lookupInfo.id.name];
      const base64Str = record[lookupInfo.image.name];
      if (id === null || id === undefined || !base64Str) continue;

      const image = new Image();
      image.src = 'data:image/png;base64,' + base64Str;
      this.imageDict[id] = image;
      await image.decode();
    }
    for (const element of this.elements) {
      element.pumpImage = this.imageDict[element.pumpID];
    }
  }

  public render(): void {
    this.drawer.setCurrentColumn(this.rect);
    this.drawer.drawPumps(this.elements);
    this.drawer.restore();
  }
}
