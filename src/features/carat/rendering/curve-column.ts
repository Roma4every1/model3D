import { CaratDrawer } from './drawer';
import { CaratCurveModel, CaratCurveStyleDict } from '../lib/types';
import { defaultSettings } from '../lib/constants';


/** Колонка каротажной диаграммы с кривыми. */
export class CaratCurveColumn implements ICaratColumn {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник колонки. */
  private readonly rect: BoundingRect;

  /** Подключённый канал со списком кривых. */
  public readonly curveSetChannel: CaratAttachedChannel;
  /** Подключённый канал с данными кривых. */
  public readonly curveDataChannel: CaratAttachedChannel;

  /** Пласты для отрисовки. */
  private elements: CaratCurveModel[];
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

  public getRange(): [number, number] {
    let min = Infinity;
    let max = -Infinity;

    for (const { top, bottom } of this.elements) {
      if (top < min) min = top;
      if (bottom > max) max = bottom;
    }
    return [min, max];
  }

  public setHeight(height: number) {
    this.rect.height = height;
  }

  public setCurveData(curves: CaratCurveModel[]) {
    for (const curve of curves) {
      curve.style = this.styleDict[curve.type] ?? defaultSettings.curveStyle
    }
    this.elements = curves;
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
