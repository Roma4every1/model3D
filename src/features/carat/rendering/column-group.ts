import { CaratDrawer } from './drawer';
import { CaratColumn } from './column';
import { CaratCurveColumn } from './curve-column';
import { CaratCurveAxis } from '../lib/types';
import { CurveManager } from '../lib/curve-manager';


/** Группа колонок каротажной диаграммы. */
export class CaratColumnGroup implements ICaratColumnGroup {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник для элементов. */
  private readonly elementsRect: BoundingRect;
  /** Высота заголовка колонки. */
  private readonly headerHeight: number;

  /** Идентификатор колонки. */
  public readonly id: string;
  /** Общие настройки. */
  public readonly settings: CaratColumnSettings;
  /** Выборки кривых. */
  public readonly curveManager: CurveManager;
  /** Граничные значения шкал кривых. */
  public readonly measures: Record<CaratCurveType, CaratCurveMeasure>;

  /** Зоны распределения каротажных кривых. */
  private zones: CaratZone[];
  /** Горизонатльные оси для кривых. */
  private curveAxes: CaratCurveAxis[];
  /** Стиль горизонтальных осей. */
  private readonly xAxis: CaratColumnXAxis;
  /** Настройки вертикальной оси колонки. */
  private readonly yAxis: CaratColumnYAxis;

  /** Каротажные колонки в группе. */
  private readonly columns: CaratColumn[];
  /** Каротажные колонки с кривыми. */
  private readonly curveColumn: CaratCurveColumn;

  private readonly channels: CaratAttachedChannel[];
  private readonly properties: Record<ChannelName, CaratColumnProperties>;
  public active: boolean;

  constructor(rect: BoundingRect, drawer: CaratDrawer, init: CaratColumnInit) {
    this.drawer = drawer;
    this.xAxis = init.xAxis;
    this.yAxis = init.yAxis;
    this.settings = init.settings;
    this.curveManager = new CurveManager(init.selection);
    this.properties = init.properties;
    this.channels = init.channels;
    this.active = init.active;

    this.measures = {};
    init.measures.forEach((measure) => { this.measures[measure.type] = measure; });

    this.headerHeight = 25;
    this.elementsRect = {...rect};
    this.elementsRect.top += this.headerHeight;
    this.elementsRect.height -= this.headerHeight;

    this.columns = [];
    let curveSetChannel: CaratAttachedChannel;
    let curveDataChannel: CaratAttachedChannel;
    const height = rect.height - this.headerHeight;

    for (const attachedChannel of init.channels) {
      const channelType = attachedChannel.type;
      if (!channelType) continue;

      if (channelType === 'curve-set') { curveSetChannel = attachedChannel; continue; }
      if (channelType === 'curve-data') { curveDataChannel = attachedChannel; continue; }

      const columnRect = {top: 0, left: 0, width: rect.width, height};
      const properties = init.properties[attachedChannel.name];
      this.columns.push(new CaratColumn(columnRect, drawer, attachedChannel, properties));
    }

    if (curveSetChannel && curveDataChannel) {
      const columnRect = {top: 0, left: 0, width: rect.width, height};
      this.curveColumn = new CaratCurveColumn(columnRect, drawer, curveSetChannel, curveDataChannel);
      this.curveManager.setChannels(curveSetChannel, curveDataChannel);
    }
  }

  public getInit(): CaratColumnInit {
    const attachedChannels = this.channels.map(attachment => ({
      name: attachment.name,
      attachOption: attachment.attachOption, exclude: attachment.exclude
    }));

    return {
      id: this.id,
      settings: this.settings,
      xAxis: this.xAxis,
      yAxis: this.yAxis,
      channels: attachedChannels,
      selection: this.curveManager.getInit(),
      measures: Object.values(this.measures),
      properties: this.properties,
      active: this.active,
    };
  }

  public getLabel(): string {
    return this.settings.label;
  }

  public getElementsRect(): BoundingRect {
    return this.elementsRect;
  }

  public getWidth(): number {
    if (this.curveColumn) {
      return this.curveColumn.getGroupWidth();
    } else {
      return this.elementsRect.width;
    }
  }

  public getElementsTop(): number {
    return this.elementsRect.top;
  }

  public getYAxisStep(): number {
    return this.yAxis.step;
  }

  public getElementsRange(): [number, number] {
    let min = Infinity;
    let max = -Infinity;

    for (const column of this.columns) {
      const [colMin, colMax] = column.getRange();
      if (colMin < min) min = colMin;
      if (colMax > max) max = colMax;
    }
    return [min, max];
  }

  public getCurvesRange(): [number, number] {
    if (this.curveColumn) return this.curveColumn.getRange();
    return [Infinity, -Infinity];
  }

  public setLabel(label: string) {
    this.settings.label = label;
  }

  public setWidth(width: number): number {
    if (this.curveColumn) {
      this.curveColumn.setGroupWidth(width);
      width = this.curveColumn.getTotalWidth();
    }
    this.elementsRect.width = width;
    for (const column of this.columns) column.rect.width = width;
    return width;
  }

  public setHeight(height: number) {
    const columnHeight = height - this.headerHeight;
    this.elementsRect.height = columnHeight;
    for (const column of this.columns) column.rect.height = columnHeight;
    if (this.curveColumn) this.curveColumn.setHeight(columnHeight);
  }

  public shift(by: number) {
    this.elementsRect.left += by;
  }

  public setYAxisStep(step: number) {
    this.yAxis.step = step;
  }

  public setZones(zones: CaratZone[]) {
    this.zones = zones;
  }

  public setChannelData(channelData: ChannelDict) {
    for (const column of this.columns) {
      const data = channelData[column.channel.name]?.data;
      column.setChannelData(data);
    }
    if (this.curveColumn) this.curveColumn.setCurveData([], this.zones);
  }

  public async setCurveData(channelData: ChannelDict) {
    if (!this.curveColumn) return 0;
    const curveSet = channelData[this.curveColumn.curveSetChannel.name];
    this.curveManager.setCurveChannelData(curveSet.data);
    const curves = this.curveManager.getDefaultCurves();
    await this.curveManager.loadCurveData(curves.map(curve => curve.id));
    this.curveColumn.setCurveData(curves, this.zones);

    // this.curveAxes = [];
    // const axesTypes = new Set(curves.map(c => c.type));
    // axesTypes.forEach((curveType) => {
    //   const color = curves.find(c => c.type === curveType).style.color;
    //   const measure = this.measures[curveType];
    //   const min = measure?.min ?? null, max = measure?.max ?? null;
    //   this.curveAxes.push({type: curveType, min, max, color});
    // });

    const oldWidth = this.elementsRect.width;
    const newWidth = this.curveColumn.getTotalWidth();

    if (oldWidth !== newWidth) {
      this.elementsRect.width = newWidth;
      for (const column of this.columns) column.rect.width = newWidth;
    }
    return newWidth - oldWidth;
  }

  public setLookupData(lookupData: ChannelDict) {
    for (const column of this.columns) column.setLookupData(lookupData);
    if (this.curveColumn) this.curveColumn.setLookupData(lookupData);
  }

  public renderBody() {
    this.drawer.setCurrentGroup(this.elementsRect, this.settings);
    this.drawer.drawColumnGroupBody(this.active);
  }

  public renderContent() {
    this.drawer.setCurrentGroup(this.elementsRect, this.settings);
    for (const column of this.columns) column.render();
    if (this.curveColumn) this.curveColumn.render();
    if (this.yAxis.show) this.drawer.drawColumnGroupYAxis(this.yAxis);
  }
}
