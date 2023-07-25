import { CaratDrawer } from './drawer';
import { CaratColumn } from './column';
import { CaratCurveColumn } from './curve-column';
import { CaratCurveModel, CaratIntervalModel } from '../lib/types';
import { CaratColumnHeader } from './column-header';
import { CurveManager } from '../lib/curve-manager';
import { distanceFromCaratCurve } from '../lib/utils';
import { isRectInnerPoint } from 'shared/lib';
import { defaultSettings, constraints } from '../lib/constants';


/** Группа колонок каротажной диаграммы. */
export class CaratColumnGroup implements ICaratColumnGroup {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник для элементов. */
  private readonly dataRect: Rectangle;

  /** Идентификатор колонки. */
  public readonly id: string;
  /** Общие настройки. */
  public readonly settings: CaratColumnSettings;
  /** Заголовок группы. */
  public readonly header: CaratColumnHeader;
  /** Выборки кривых. */
  public readonly curveManager: CurveManager;

  /** Зоны распределения каротажных кривых. */
  private zones: CaratZone[];
  /** Стиль горизонтальных осей. */
  public readonly xAxis: CaratColumnXAxis;
  /** Настройки вертикальной оси колонки. */
  public readonly yAxis: CaratColumnYAxis;

  /** Каротажные колонки в группе. */
  private readonly columns: CaratColumn[];
  /** Каротажные колонки с кривыми. */
  private readonly curveColumn: CaratCurveColumn | null;

  private readonly channels: CaratAttachedChannel[];
  private readonly properties: Record<ChannelName, CaratColumnProperties>;
  public active: boolean;

  constructor(rect: Rectangle, drawer: CaratDrawer, init: CaratColumnInit) {
    this.id = init.id;
    this.drawer = drawer;
    this.settings = init.settings;
    this.header = new CaratColumnHeader(drawer, init.settings.label);
    this.curveManager = new CurveManager(init.selection, init.measures);
    this.properties = init.properties;
    this.channels = init.channels;
    this.active = init.active;

    this.yAxis = init.yAxis;
    this.xAxis = init.xAxis ?? defaultSettings.xAxis;
    const { min: minMarks, max: maxMarks } = constraints.yAxisMarks;
    if (this.xAxis.numberOfMarks < minMarks) this.xAxis.numberOfMarks = minMarks;
    if (this.xAxis.numberOfMarks > maxMarks) this.xAxis.numberOfMarks = maxMarks;

    const headerHeight = this.header.getHeight();
    this.dataRect = {...rect};
    this.dataRect.top += headerHeight;
    this.dataRect.height -= headerHeight;

    this.columns = [];
    this.curveColumn = null;
    this.zones = [];

    let curveSetChannel: CaratAttachedChannel;
    let curveDataChannel: CaratAttachedChannel;
    const height = rect.height - headerHeight;

    for (const attachedChannel of init.channels) {
      const channelType = attachedChannel.type;
      if (!channelType || channelType === 'inclinometry') continue;

      if (channelType === 'curve-set') { curveSetChannel = attachedChannel; continue; }
      if (channelType === 'curve-data') { curveDataChannel = attachedChannel; continue; }

      const columnRect = {top: 0, left: 0, width: rect.width, height};
      const properties = init.properties[attachedChannel.name];
      this.columns.push(new CaratColumn(columnRect, drawer, attachedChannel, properties));
    }

    if (curveSetChannel && curveDataChannel) {
      const columnRect = {top: 0, left: 0, width: rect.width, height};
      this.curveColumn = new CaratCurveColumn(columnRect, drawer, curveSetChannel);
      this.curveManager.setChannel(curveSetChannel);
    }
  }

  /** Копирует группу для прямоугольника. */
  public cloneFor(rect: Rectangle): CaratColumnGroup {
    const top = this.drawer.trackHeaderSettings.height;
    const dataRect = {...this.dataRect, top, height: rect.height - top};

    const header = new CaratColumnHeader(this.drawer, this.settings.label);
    const headerHeight = header.getHeight();
    dataRect.top += headerHeight;
    dataRect.height -= headerHeight;

    const copy = {
      drawer: this.drawer,
      dataRect: dataRect,
      id: this.id,
      settings: {...this.settings},
      header: new CaratColumnHeader(this.drawer, this.settings.label),
      curveManager: this.curveManager.copy(),
      zones: this.zones,
      xAxis: {...this.xAxis},
      yAxis: {...this.yAxis},
      columns: this.columns.map(c => c.copy()),
      curveColumn: this.curveColumn?.copy() ?? null,
      channels: this.channels,
      properties: this.properties,
    };
    Object.setPrototypeOf(copy, CaratColumnGroup.prototype);
    return copy as any as CaratColumnGroup;
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
      selection: this.curveManager.getInitSelection(),
      measures: this.curveManager.getInitMeasures(),
      properties: this.properties,
      active: this.active,
    };
  }

  /** Возвращает список названий справочников, необходимых для отрисовки. */
  public getLookupNames(): ChannelName[] {
    const names: ChannelName[] = [];
    for (const column of this.columns) names.push(...column.getLookupNames());
    const curveSetChannel = this.curveManager.curveSetChannel;
    if (curveSetChannel?.curveColorLookup) names.push(curveSetChannel.curveColorLookup.name);
    return names;
  }

  public getColumns(): ICaratColumn[] {
    return this.columns;
  }

  public getDataRect(): Rectangle {
    return this.dataRect;
  }

  public getIntervals(): CaratIntervalModel[] {
    const lithologyColumn = this.columns.find(c => c.channel.type === 'lithology');
    return lithologyColumn ? lithologyColumn.getElements() : [];
  }

  public getWidth(): number {
    if (this.curveColumn) {
      return this.curveColumn.getGroupWidth();
    } else {
      return this.dataRect.width;
    }
  }

  public getRange(): [number, number] {
    let min = Infinity;
    let max = -Infinity;

    for (const column of this.columns) {
      const [colMin, colMax] = column.getRange();
      if (colMin < min) min = colMin;
      if (colMax > max) max = colMax;
    }
    if (this.curveColumn) {
      const [curveMin, curveMax] = this.curveColumn.getRange();
      if (curveMin < min) min = curveMin;
      if (curveMax > max) max = curveMax;
    }
    return [min, max];
  }

  public hasCurveColumn(): boolean {
    return Boolean(this.curveColumn);
  }

  public setLabel(label: string) {
    this.header.setLabel(label);
    this.settings.label = label;
  }

  public setWidth(width: number): number {
    this.settings.width = width;
    if (this.curveColumn) {
      this.header.setGroupWidth(width);
      this.curveColumn.setGroupWidth(width);
      width = this.curveColumn.getTotalWidth();
    }

    this.dataRect.width = width;
    for (const column of this.columns) column.rect.width = width;
    return width;
  }

  public setHeight(height: number) {
    const columnHeight = height - this.header.getHeight();
    this.dataRect.height = columnHeight;
    for (const column of this.columns) column.rect.height = columnHeight;
    if (this.curveColumn) this.curveColumn.setHeight(columnHeight);
  }

  public setHeaderHeight(height: number) {
    const delta = height - this.header.getHeight();
    this.header.setHeight(height);
    this.dataRect.top += delta;
    this.dataRect.height -= delta;

    const elementsHeight = this.dataRect.height;
    for (const column of this.columns) column.rect.height = elementsHeight;
    if (this.curveColumn) this.curveColumn.setHeight(elementsHeight);
  }

  public shift(by: number) {
    this.dataRect.left += by;
  }

  /** Делает перестроение зон, возвращает изменение ширины. */
  public setZones(zones: CaratZone[]): number {
    this.zones = zones;
    if (!this.curveColumn) return 0;
    const curves = this.curveManager.getVisibleCurves();
    return this.groupCurves(curves);
  }

  public setActiveCurve(id?: CaratCurveID) {
    if (!this.curveColumn) return;
    this.curveManager.setActiveCurve(id);
  }

  /** Точка в системе координат трека. */
  public getNearCurve(p: Point, viewport: CaratViewport): CaratCurveModel | null {
    if (!this.curveColumn) return null;
    p.x -= this.dataRect.left;
    p.y -= this.dataRect.top;

    const group = this.curveColumn.getGroups().find((g) => isRectInnerPoint(p, g.rect));
    if (!group) return null;
    const { rect, elements } = group;

    const groupPoint: Point = {x: p.x - rect.left, y: p.y - rect.top};
    let minDistance = Infinity;
    let nearestCurve: CaratCurveModel = null;

    for (const curve of elements) {
      const distance = distanceFromCaratCurve(groupPoint, curve, rect, viewport);
      if (distance < minDistance) { minDistance = distance; nearestCurve = curve; }
    }
    return minDistance < 5 ? nearestCurve : null;
  }

  /** Задаёт новый список элементов и кривых, возвращает изменение ширины. */
  public setData(data: ChannelRecordDict, cache: CurveDataCache): number {
    for (const column of this.columns) {
      const rows = data[column.channel.name];
      column.setChannelData(rows);
    }

    if (!this.curveColumn) return 0;
    const curveSetData = data[this.curveColumn.curveSetChannel.name];
    this.curveManager.setCurveChannelData(curveSetData, cache);
    return this.groupCurves(this.curveManager.getVisibleCurves());
  }

  /** Группирует кривые по зонам, возвращает изменение ширины. */
  private groupCurves(curves: CaratCurveModel[]): number {
    this.curveColumn.setCurveData(curves, this.zones);
    this.header.setAxes(this.curveColumn.getGroups());

    const oldWidth = this.dataRect.width;
    const newWidth = this.curveColumn.getTotalWidth();

    if (oldWidth !== newWidth) {
      this.dataRect.width = newWidth;
      for (const column of this.columns) column.rect.width = newWidth;
    }
    return newWidth - oldWidth;
  }

  public setLookupData(lookupData: ChannelRecordDict) {
    for (const column of this.columns) column.setLookupData(lookupData);
    if (this.curveColumn) this.curveManager.setStyleData(lookupData);
  }

  public renderHeader() {
    this.drawer.setCurrentGroup(this.dataRect, this.settings);
    this.header.render(this.xAxis);
  }

  public renderContent() {
    this.drawer.setCurrentGroup(this.dataRect, this.settings);
    for (const column of this.columns) column.render();

    const curveAxes = this.header.getCurveAxes();
    if (curveAxes.length && this.xAxis.grid) this.drawer.drawVerticalGrid(this.xAxis, curveAxes);
    if (this.curveColumn) this.curveColumn.render();

    if (this.yAxis.show) this.drawer.drawGroupYAxis(this.yAxis);
    this.drawer.drawGroupBody(this.active);
  }
}
