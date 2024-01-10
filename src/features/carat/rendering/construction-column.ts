import { CaratDrawer } from './drawer';
import { ConstructionElementModel, ConstructionElementStyle } from '../lib/types';
import { defaultSettings } from '../lib/constants.ts';


/** Колонка, содержащая элементы конструкции скважины. */
export class ConstructionColumn implements ICaratColumn {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник колонки. */
  public readonly rect: Rectangle;
  /** Массив подключённых свойств канала. */
  public readonly channel: CaratAttachedChannel;

  /** Элементы конструкции. */
  private elements: ConstructionElementModel[];
  /** Настройки внешнего вида элементов конструкции. */
  private style: ConstructionElementStyle;

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
    const defaultStyle = defaultSettings.constructionElementStyle;

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
    const column = new ConstructionColumn({...this.rect}, this.drawer, this.channel, null);
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
    // пока нет настроек внешнего вида
  }

  public render(): void {
    this.drawer.setCurrentColumn(this.rect);
    if (this.elements.length) this.drawer.drawConstructionElements(this.elements, this.style);
    this.drawer.restore();
  }
}
