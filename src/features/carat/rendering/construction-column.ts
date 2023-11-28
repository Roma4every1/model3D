import { CaratDrawer } from './drawer';
import { ConstructionElementModel } from '../lib/types';


/** Колонка, содержащая элементы конструкции скважины. */
export class ConstructionColumn implements ICaratColumn {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник колонки. */
  public readonly rect: Rectangle;
  /** Массив подключённых свойств канала. */
  public readonly channel: CaratAttachedChannel;

  private elements: ConstructionElementModel[];

  constructor(rect: Rectangle, drawer: CaratDrawer, channel: CaratAttachedChannel) {
    this.drawer = drawer;
    this.rect = rect;
    this.channel = channel;
    this.elements = [];
  }

  public copy(): ICaratColumn {
    return new ConstructionColumn({...this.rect}, this.drawer, this.channel);
  }

  public getLookupNames(): ChannelName[] {
    return [];
  }

  public getElements?(): any[] {
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
    const info = this.channel.info;
    this.elements = records.map((record: ChannelRecord) => {
      const top = record[info.top.name];
      const bottom = record[info.bottom.name];
      const innerDiameter = record[info.innerDiameter.name];
      const outerDiameter = record[info.outerDiameter.name];
      const cement = record[info.cement.name];
      return {top, bottom, innerDiameter, outerDiameter, cement};
    });
  }

  public setLookupData(): void {
    // пока нет настроек внешнего вида
  }

  public render(): void {
    this.drawer.setCurrentColumn(this.rect);
    if (this.elements.length) this.drawer.drawConstructionElements(this.elements);
    this.drawer.restore();
  }
}
