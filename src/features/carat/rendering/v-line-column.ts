import { CaratDrawer } from './drawer.ts';
import { CaratVerticalLineModel } from '../lib/types.ts';
import { defaultSettings } from '../lib/constants.ts';


export class VerticalLineColumn implements ICaratColumn {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник колонки. */
  public readonly rect: Rectangle;
  /** Массив подключённых свойств канала. */
  public readonly channel: CaratAttachedChannel;

  private elements: CaratVerticalLineModel[];
  private color: ColorHEX;

  constructor(
    rect: Rectangle, drawer: CaratDrawer,
    channel: CaratAttachedChannel, properties?: CaratColumnProperties,
  ) {
    this.drawer = drawer;
    this.rect = rect;
    this.channel = channel;
    this.elements = [];

    if (properties) {
      const widthProperty = properties[channel.info.width.name];
      this.color = widthProperty?.bar?.color ?? defaultSettings.verticalLineColor;
    }
  }

  public copy(): ICaratColumn {
    const copy = new VerticalLineColumn({...this.rect}, this.drawer, this.channel);
    copy.color = this.color;
    return copy;
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
      const width = record[info.width.name];
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
