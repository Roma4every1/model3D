import { CaratDrawer } from './drawer';
import { CaratCurveAxis } from '../lib/types';
import { CurveSelection } from '../lib/curve-selection';
import { CaratColumn, CaratCurveColumn } from './column';
import { applyInfoIndexes, loadCaratCurves } from '../lib/channels';


/** Группа колонок каротажной диаграммы. */
export class CaratColumnGroup implements ICaratColumnGroup {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник колонки. */
  private readonly rect: BoundingRect;
  /** Ограничивающий прямоугольник для элементов. */
  private readonly elementsRect: BoundingRect;
  /** Высота заголовка колонки. */
  private readonly headerHeight: number;
  private readonly isNormal: boolean;

  /** Идентификатор колонки. */
  public readonly id: string;
  /** Общие настройки. */
  public readonly settings: CaratColumnSettings;
  /** Выборки кривых. */
  public readonly selection: CurveSelection;
  /** Граничные значения шкал кривых. */
  public readonly measures: CaratCurveMeasure[];

  /** Горизонатльные оси для кривых. */
  private curveAxes: CaratCurveAxis[];
  /** Стиль горизонтальных осей. */
  private readonly xAxis: CaratColumnXAxis;
  /** Настройки вертикальной оси колонки. */
  private readonly yAxis: CaratColumnYAxis;

  private readonly zones: CaratZone[];
  /** Каротажные колонки в группе. */
  private readonly columns: CaratColumn[];
  /** Каротажные колонки с кривыми. */
  private readonly curveColumns: CaratCurveColumn[];

  private readonly channels: CaratAttachedChannel[];
  private readonly properties: Record<ChannelName, CaratColumnProperties>;
  private readonly active: boolean;

  constructor(rect: BoundingRect, zones: CaratZone[], drawer: CaratDrawer, init: CaratColumnInit) {
    this.drawer = drawer;
    this.rect = rect;
    this.zones = zones;
    this.xAxis = init.xAxis;
    this.yAxis = init.yAxis;
    this.settings = init.settings;
    this.selection = new CurveSelection(init.selection);
    this.measures = init.measures;
    this.properties = init.properties;
    this.channels = init.channels;
    this.active = init.active;
    this.isNormal = init.settings.type === 'normal';

    this.headerHeight = 25;
    this.elementsRect = {...rect};
    this.elementsRect.top += this.headerHeight;
    this.elementsRect.height -= this.headerHeight;

    this.columns = [];
    this.curveColumns = [];
    let curveSetChannel: CaratAttachedChannel;
    let curveDataChannel: CaratAttachedChannel;
    const height = rect.height - this.headerHeight;

    for (const attachedChannel of init.channels) {
      const channelType = attachedChannel.type;
      if (!channelType) continue;

      if (channelType === 'curve-set') { curveSetChannel = attachedChannel; continue; }
      if (channelType === 'curve-data') { curveDataChannel = attachedChannel; continue; }
      const columnRect = {top: 0, left: 0, width: rect.width, height};
      this.columns.push(new CaratColumn(columnRect, drawer, attachedChannel));
    }

    if (curveSetChannel && curveDataChannel && (!zones || !zones.length)) {
      const columnRect = {top: 0, left: 0, width: rect.width, height};
      this.curveColumns.push(new CaratCurveColumn(columnRect, drawer, curveSetChannel, curveDataChannel));
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
      selection: this.selection.getInit(),
      measures: this.measures,
      properties: this.properties,
      active: this.active,
    };
  }

  public getLabel(): string {
    return this.settings.label;
  }

  public getWidth(): number {
    return this.rect.width;
  }

  public getYAxisStep(): number {
    return this.yAxis.step;
  }

  public getMinY() {
    const coordinates = this.columns.map(c => c.getMinY());
    return Math.min(...coordinates);
  }

  public setLabel(label: string) {
    this.settings.label = label;
  }

  public setWidth(width: number) {
    this.rect.width = width;
  }

  public setHeight(height: number) {
    this.rect.height = height;
    const columnHeight = height - this.headerHeight;
    this.elementsRect.height = columnHeight;
    for (const column of this.columns) column.setHeight(columnHeight);
    for (const column of this.curveColumns) column.setHeight(columnHeight);
  }

  public setYAxisStep(step: number) {
    this.yAxis.step = step;
  }

  public setChannelData(channelData: ChannelDict) {
    for (const column of this.columns) {
      const attachedChannel = column.channel;
      const channel = channelData[attachedChannel.name];
      const rows = channel?.data?.rows;
      if (rows && !attachedChannel.applied) applyInfoIndexes(attachedChannel, channel.data.columns);
      column.setChannelData(rows ?? []);
    }
  }

  public async setCurveData(channelData: ChannelDict) {
    for (const column of this.curveColumns) {
      const curveSetChannel = column.curveSetChannel;
      const curveSet = channelData[column.curveSetChannel.name];
      const rawRows = curveSet?.data?.rows;
      if (rawRows && !curveSetChannel.applied) applyInfoIndexes(curveSetChannel, curveSet.data.columns);

      const curveSetInfo: CaratCurveSetInfo = column.curveSetChannel.info as any;
      const rows = this.selection.filterCurves(rawRows ?? [], curveSetInfo);
      const idIndex = curveSetInfo.id.index;
      const curvesID = rows.map(row => row.Cells[idIndex]).filter(Boolean);

      const curveDataChannel = column.curveDataChannel;
      const curveData = await loadCaratCurves(curveDataChannel.name, curvesID);
      if (curveData && !curveDataChannel.applied) applyInfoIndexes(curveDataChannel, curveData.columns)
      column.setCurveData(curveData.rows);
    }
  }

  public setLookupData(lookupData: ChannelDict) {
    // for (const column of this.columns) {
    //   column.setLookupData(lookupData);
    // }
    // for (const column of this.curveColumns) {
    //   column.setLookupData(lookupData);
    // }
  }

  public render() {
    this.drawer.setCurrentGroup(this.elementsRect);
    for (const column of this.columns) column.render();
    for (const column of this.curveColumns) column.render();
    if (this.yAxis.show) this.drawer.drawColumnGroupYAxis(this.yAxis);
    if (this.isNormal)this.drawer.drawColumnGroupBody(this.settings);
  }
}
