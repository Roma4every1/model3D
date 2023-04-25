import { CaratDrawer } from './drawer';
import { CaratCurveStyleDict, CaratElementCurve } from '../lib/types';
import { CaratElementInterval, CaratIntervalStyleDict } from '../lib/types';
import { createCaratIntervals, createCaratCurves } from '../lib/channels';


/** Колонка каротажной диаграммы. */
export class CaratColumn {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Массив подключённых свойств канала. */
  public readonly channel: CaratAttachedChannel;

  /** Ограничивающий прямоугольник колонки. */
  private rect: BoundingRect;
  /** Пласты для отрисовки. */
  private elements: CaratElementInterval[];
  /** Словарь свойств внешнего вида пластов. */
  private styleDict: CaratIntervalStyleDict;

  constructor(rect: BoundingRect, drawer: CaratDrawer, channel: CaratAttachedChannel) {
    this.rect = rect;
    this.drawer = drawer;
    this.channel = channel;
    this.elements = [];
  }

  public getMinY() {
    const coordinates = this.elements.map(e => e.top);
    return Math.min(...coordinates);
  }

  public setHeight(height: number) {
    this.rect.height = height;
  }

  public setChannelData(rows: ChannelRow[]) {
    const info = this.channel.info;
    if (info.top) this.elements = createCaratIntervals(rows, info as any);
  }

  public setLookupData(lookupData: ChannelDict) {
    this.styleDict = {};
  }

  public render() {
    this.drawer.setCurrentColumn(this.rect);
    this.drawer.drawIntervals(this.elements);
  }
}

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

  public setCurveData(rows: ChannelRow[]) {
    this.elements = createCaratCurves(rows, this.curveDataChannel.info as any);
  }

  public setLookupData(lookupData: ChannelDict) {
    this.styleDict = {};
  }

  public render() {
    this.drawer.setCurrentColumn(this.rect);
    this.drawer.drawCurves(this.elements);
  }
}
