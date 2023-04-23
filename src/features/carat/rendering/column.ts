import { CaratDrawer } from './drawer';
import { CaratCurveAxis, CaratElementInterval, CaratIntervalStyleDict } from '../lib/types';
import { applyIndexesToModel } from '../lib/initialization';
import { getCaratIntervals } from '../lib/channels';


/** Группа колонок каротажной диаграммы. */
export class CaratColumnGroup implements ICaratColumnGroup {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник колонки. */
  private readonly rect: BoundingRect;
  /** Ограничивающий прямоугольник для элементов. */
  private readonly elementsRect: BoundingRect;
  /** Высота заголовка колонки. */
  private headerHeight: number;

  /** Имя колонки. */
  private label: string;

  /** Горизонатльные оси для кривых. */
  private curveAxes: CaratCurveAxis[];
  /** Стиль горизонтальных осей. */
  private readonly xAxis: CaratColumnXAxis;
  /** Настройки вертикальной оси колонки. */
  private readonly yAxis: CaratColumnYAxis;

  private readonly zones: CaratZone[];
  /** Каротажный колонки в группе. */
  private readonly columns: CaratColumn[];

  constructor(rect: BoundingRect, zones: CaratZone[], drawer: CaratDrawer, init: CaratColumnInit) {
    this.drawer = drawer;
    this.rect = rect;
    this.zones = zones;
    this.xAxis = init.xAxis;
    this.yAxis = init.yAxis;
    this.label = init.settings.label;
    this.yAxis.absMarks = true;

    this.headerHeight = 50;
    this.elementsRect = {...rect};
    this.elementsRect.top += this.headerHeight;
    this.elementsRect.height -= this.headerHeight;

    this.columns = init.channels.map((channel) => {
      return new CaratColumn({...this.elementsRect}, drawer, channel);
    });
  }

  public getLabel(): string {
    return this.label;
  }

  public getWidth(): number {
    return this.rect.width;
  }

  public getYAxisStep(): number {
    return this.yAxis.step;
  }

  public setLabel(label: string) {
    this.label = label;
  }

  public setWidth(width: number) {
    this.rect.width = width;
  }

  public setHeight(height: number) {
    this.rect.height = height;
    this.rect.bottom = this.rect.top + height;
    this.elementsRect.height = height - this.headerHeight;
    this.elementsRect.bottom = this.elementsRect.top + this.elementsRect.height;
    for (const column of this.columns) column.setRect({...this.elementsRect});
  }

  public setScale(scale: number) {
    for (const column of this.columns) column.setScale(scale);
  }

  public setYAxisStep(step: number) {
    this.yAxis.step = step;
  }

  public setChannelData(channelData: ChannelDict) {
    for (const column of this.columns) column.setChannelData(channelData);
  }

  public setLookupData(lookupData: ChannelDict) {
    for (const column of this.columns) column.setLookupData(lookupData);
  }

  public render(viewport: CaratViewport) {
    for (const column of this.columns) column.render(viewport);
    if (this.yAxis.show) this.drawer.drawColumnYAxis(this.elementsRect, this.yAxis, viewport);
    this.drawer.drawColumnBody(this.elementsRect, this.label);
  }
}

/** Колонка каротажной диаграммы. */
export class CaratColumn implements ICaratColumn {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Массив подключённых свойств канала. */
  private readonly channel: CaratAttachedChannel;

  /** Ограничивающий прямоугольник колонки. */
  private rect: BoundingRect;
  /** Пласты для отрисовки. */
  private elements: CaratElementInterval[];
  /** Словарь свойств внешнего вида пластов. */
  private readonly styleDict: CaratIntervalStyleDict;

  constructor(rect: BoundingRect, drawer: CaratDrawer, channel: CaratAttachedChannel) {
    this.rect = rect;
    this.drawer = drawer;
    this.channel = channel;
    this.elements = [];
  }

  public setRect(rect: BoundingRect) {
    this.rect = rect;
  }

  public setScale(scale: number) {

  }

  public setChannelData(channelData: ChannelDict) {
    if (this.channel.type !== 'intervals') return;
    const channel = channelData[this.channel.name];
    const channelColumns = channel?.data?.columns;

    if (!channelColumns) return;
    if (!this.channel.applied) applyIndexesToModel(this.channel, channelColumns);
    this.elements = getCaratIntervals(channel.data.rows, this.channel.info);
  }

  public setLookupData(lookupData: ChannelDict) {

  }

  public render(viewport: CaratViewport) {
    this.drawer.drawIntervals(this.rect, viewport, this.elements);
  }
}
