import { CaratDrawer } from './drawer';
import { WellBoreElementModel, WellBoreElementStyle } from '../lib/types';
import { defaultSettings } from '../lib/constants';


/** Колонка, содержащая элементы ствола скважины. */
export class WellBoreColumn implements ICaratColumn {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник колонки. */
  public readonly rect: Rectangle;
  /** Массив подключённых свойств канала. */
  public readonly channel: CaratAttachedChannel;

  /** Элементы конструкции. */
  private elements: WellBoreElementModel[];
  /** Настройки внешнего вида элементов конструкции. */
  private style: WellBoreElementStyle;

  constructor(
    rect: Rectangle, drawer: CaratDrawer,
    channel: CaratAttachedChannel, properties: CaratColumnProperties,
  ) {
    this.drawer = drawer;
    this.rect = rect;
    this.channel = channel;
    this.elements = [];
    if (properties) this.createStyle(properties);
  }

  private createStyle(properties: CaratColumnProperties): void {
    const info = this.channel.info;
    const defaultStyle = defaultSettings.wellBoreElementStyle;

    const innerDiameterProperty = properties[info.innerDiameter.name]?.bar;
    const outerDiameterProperty = properties[info.outerDiameter.name]?.bar;
    const cementProperty = properties[info.cement.name]?.bar;

    this.style = {
      innerDiameter: innerDiameterProperty?.backgroundColor ?? defaultStyle.innerDiameter,
      outerDiameter: outerDiameterProperty?.backgroundColor ?? defaultStyle.outerDiameter,
      cement: cementProperty?.backgroundColor ?? defaultStyle.cement,
    };
  }

  public copy(): ICaratColumn {
    const column = new WellBoreColumn({...this.rect}, this.drawer, this.channel, null);
    column.style = this.style;
    return column;
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
      const label = record[info.label.name];
      return {top, bottom, innerDiameter, outerDiameter, cement, label};
    });
  }

  public setLookupData(): void {
    // все настройки внешнего вида — константы сессии
  }

  public render(): void {
    this.drawer.setCurrentColumn(this.rect);
    if (this.elements.length) this.drawer.drawWellBore(this.elements, this.style);
    this.drawer.restore();
  }
}
