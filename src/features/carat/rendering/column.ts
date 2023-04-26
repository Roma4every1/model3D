import { CaratDrawer } from './drawer';
import { CaratElementBar, CaratElementInterval, CaratIntervalStyleDict } from '../lib/types';
import { applyInfoIndexes } from '../lib/channels';
import { defaultSettings } from '../lib/constants';


/** Колонка каротажной диаграммы. */
export class CaratColumn {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник колонки. */
  private readonly rect: BoundingRect;
  /** Массив подключённых свойств канала. */
  public readonly channel: CaratAttachedChannel;
  /** Словарь настроек отображения свойств. */
  private readonly properties: CaratColumnProperties;

  /** Пласты. */
  private elements: CaratElementInterval[];
  /** Словарь свойств внешнего вида пластов. */
  private styleDict: CaratIntervalStyleDict;

  /** Гистограммы */
  private bars: CaratElementBar[];
  private barsStyle: CaratBarPropertySettings | null;

  constructor(
    rect: BoundingRect, drawer: CaratDrawer,
    channel: CaratAttachedChannel, properties: CaratColumnProperties
  ) {
    this.rect = rect;
    this.drawer = drawer;
    this.channel = channel;
    this.properties = properties;

    this.elements = [];
    this.styleDict = {};
    this.bars = [];
    this.barsStyle = null;
  }

  public getMinY() {
    const coordinates = this.elements.map(e => e.top);
    return Math.min(...coordinates);
  }

  public setHeight(height: number) {
    this.rect.height = height;
  }

  public setChannelData(data: ChannelData) {
    const info = this.channel.info as CaratLithologyInfo;
    const barProperty = this.channel.properties.find(p => this.properties[p.name]?.showBar);
    if (barProperty && !info.bar) info.bar = {name: barProperty.fromColumn, index: -1};

    this.elements = [];
    this.bars = [];

    const rows = data?.rows;
    if (rows && !this.channel.applied) applyInfoIndexes(this.channel, data.columns);

    const topIndex = info.top.index;
    const baseIndex = info.base.index;

    if (barProperty) {
      this.barsStyle = this.properties[barProperty.name].bar;
      const barIndex = info.bar.index;
      const max = Math.max(...rows.map(row => row.Cells[barIndex]));

      this.bars = rows.map((row): CaratElementBar => {
        const cells = row.Cells;
        return {top: cells[topIndex], base: cells[baseIndex], value: cells[barIndex] / max};
      });
    } else {
      const styleIndex = info.style?.index;
      this.elements = rows.map((row): CaratElementInterval => {
        const cells = row.Cells;
        const style = this.styleDict[cells[styleIndex]] ?? defaultSettings.intervalStyle as any;
        return {top: cells[topIndex], base: cells[baseIndex], style};
      });
    }
  }

  public setLookupData(lookupData: ChannelDict) {
    const lookup = lookupData[this.channel.style?.name]
    const rows = lookup?.data?.rows;
    this.styleDict = {};

    if (rows) {
      if (!this.channel.style.applied) applyInfoIndexes(this.channel.style, lookup.data.columns);
      const info = this.channel.style.info;

      for (const { Cells: cells } of rows) {
        const id = cells[info.id.index];
        const borderColor = cells[info.borderColor.index];
        const backgroundColor = cells[info.backgroundColor.index];
        const fillStyle = cells[info.fillStyle.index];
        const lineStyle = cells[info.lineStyle.index];
        this.styleDict[id] = {borderColor, backgroundColor, fillStyle, lineStyle};
      }
    }
  }

  public render() {
    this.drawer.setCurrentColumn(this.rect);
    if (this.elements.length) this.drawer.drawIntervals(this.elements);
    if (this.bars.length) this.drawer.drawBars(this.bars, this.barsStyle);
  }
}
