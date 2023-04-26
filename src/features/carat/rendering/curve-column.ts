import { CaratDrawer } from './drawer';
import { CaratCurveStyleDict, CaratElementCurve } from '../lib/types';
import { defaultSettings } from '../lib/constants';


/** Колонка каротажной диаграммы с кривыми. */
export class CaratCurveColumn {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник колонки. */
  private readonly rect: BoundingRect;

  /** Подключённый канал со списком кривых. */
  public readonly curveSetChannel: CaratAttachedChannel;
  /** Подключённый канал с данными кривых. */
  public readonly curveDataChannel: CaratAttachedChannel;

  /** Пласты для отрисовки. */
  private elements: CaratElementCurve[];
  /** Словарь свойств внешнего вида пластов. */
  private styleDict: CaratCurveStyleDict;

  constructor(
    rect: BoundingRect, drawer: CaratDrawer,
    curveSetChannel: CaratAttachedChannel, curveDataChannel: CaratAttachedChannel
  ) {
    this.rect = rect;
    this.drawer = drawer;
    this.curveSetChannel = curveSetChannel;
    this.curveDataChannel = curveDataChannel;
    this.elements = [];
  }

  public setHeight(height: number) {
    this.rect.height = height;
  }

  public setCurveData(rows: ChannelRow[], typeDict: Record<number, CaratCurveType>) {
    const info = this.curveDataChannel.info as CaratCurveDataInfo;
    const idIndex = info.id.index;
    const dataIndex = info.data.index;
    const topIndex = info.top.index;
    const leftIndex = info.left.index;

    this.elements = rows.map((row): CaratElementCurve => {
      const cells = row.Cells;
      const id = cells[idIndex];
      const top = cells[topIndex], left = cells[leftIndex];

      const source = window.atob(cells[dataIndex]);
      const path = new Path2D(source);
      const style = this.styleDict[typeDict[id]] ?? defaultSettings.curveStyle;
      return {top, left, path, style};
    });
  }

  public setLookupData(lookupData: ChannelDict) {
    this.styleDict = {};
    const curveColorChannel = lookupData[this.curveSetChannel.style.name];

    curveColorChannel?.data?.rows?.forEach((row) => {
      let [type, color] = row.Cells as [string, string];
      if (color.length > 7) color = color.substring(0, 7);
      this.styleDict[type] = {color, thickness: 2};
    });
  }

  public render() {
    this.drawer.setCurrentColumn(this.rect);
    this.drawer.drawCurves(this.elements);
  }
}
