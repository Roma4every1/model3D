import type { CaratColumnProperties } from '../lib/dto.types';
import type { CaratVerticalLineModel } from '../lib/construction.types';
import { CaratDrawer } from './drawer';
import { defaultSettings } from '../lib/constants';


export class VerticalLineColumn implements ICaratColumn {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник колонки. */
  public readonly rect: Rectangle;
  /** Массив подключённых свойств канала. */
  public readonly channel: AttachedChannel;
  /** Является ли колонка видимой. */
  public visible: boolean;

  private elements: CaratVerticalLineModel[];
  private color: ColorString;

  constructor(
    rect: Rectangle, drawer: CaratDrawer,
    channel: AttachedChannel, properties?: CaratColumnProperties,
  ) {
    this.drawer = drawer;
    this.rect = rect;
    this.channel = channel;
    this.visible = true;
    this.elements = [];

    if (properties) {
      const widthProperty = properties[channel.info.width.propertyName];
      this.color = widthProperty?.bar?.color ?? defaultSettings.verticalLineColor;
    }
  }

  public copy(): ICaratColumn {
    const copy = new VerticalLineColumn({...this.rect}, this.drawer, this.channel);
    copy.color = this.color;
    copy.visible = this.visible;
    return copy;
  }

  public getLookups(): ChannelID[] {
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
      const top = record[info.top.columnName];
      const bottom = record[info.bottom.columnName];
      const width = record[info.width.columnName];
      this.elements.push({top, bottom, width});
    }
  }

  public setLookupData(): void {
    // все настройки внешнего вида — константы сессии
  }

  public render(): void {
    this.drawer.setCurrentColumn(this.rect);
    this.drawer.drawVerticalLines(this.elements, this.color);
    this.drawer.restore();
  }
}
