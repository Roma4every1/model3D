import type { CaratColumnProperties } from '../lib/dto.types';
import type { WellBoreElementModel, WellBoreElementStyle } from '../lib/construction.types';
import { CaratDrawer } from './drawer';
import { defaultSettings } from '../lib/constants';


/** Колонка, содержащая элементы ствола скважины. */
export class WellBoreColumn implements ICaratColumn {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник колонки. */
  public readonly rect: Rectangle;
  /** Массив подключённых свойств канала. */
  public readonly channel: AttachedChannel;
  /** Является ли колонка видимой. */
  public visible: boolean;

  /** Элементы конструкции. */
  private elements: WellBoreElementModel[];
  /** Настройки внешнего вида элементов конструкции. */
  private style: WellBoreElementStyle;

  constructor(
    rect: Rectangle, drawer: CaratDrawer,
    channel: AttachedChannel, properties: CaratColumnProperties,
  ) {
    this.drawer = drawer;
    this.rect = rect;
    this.channel = channel;
    this.visible = true;
    this.elements = [];
    if (properties) this.createStyle(properties);
  }

  private createStyle(properties: CaratColumnProperties): void {
    const info = this.channel.info;
    const defaultStyle = defaultSettings.wellBoreElementStyle;

    const innerDiameterProperty = properties[info.innerDiameter.propertyName]?.bar;
    const outerDiameterProperty = properties[info.outerDiameter.propertyName]?.bar;
    const cementProperty = properties[info.cement.propertyName]?.bar;

    this.style = {
      innerColor: innerDiameterProperty?.backgroundColor ?? defaultStyle.innerDiameter,
      outerColor: outerDiameterProperty?.backgroundColor ?? defaultStyle.outerDiameter,
      cementColor: cementProperty?.backgroundColor ?? defaultStyle.cement,
    };
  }

  public copy(): ICaratColumn {
    const column = new WellBoreColumn({...this.rect}, this.drawer, this.channel, null);
    column.style = this.style;
    column.visible = this.visible;
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
      const top = record[info.top.columnName];
      const bottom = record[info.bottom.columnName];
      const innerDiameter = record[info.innerDiameter.columnName];
      const outerDiameter = record[info.outerDiameter.columnName];
      const cement = record[info.cement.columnName];
      const label = record[info.label.columnName];
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
