import { CaratDrawer } from './drawer';
import { CaratColumn } from './column';
import { CaratCurveColumn } from './curve-column';
import { CaratCurveModel } from '../lib/types';
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
  private readonly elementsRect: Rectangle;

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
    this.elementsRect = {...rect};
    this.elementsRect.top += headerHeight;
    this.elementsRect.height -= headerHeight;

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
      selection: this.curveManager.getInitSelection(),
      measures: this.curveManager.getInitMeasures(),
      properties: this.properties,
      active: this.active,
    };
  }

  public getColumns(): ICaratColumn[] {
    return this.columns;
  }

  public getElementsRect(): Rectangle {
    return this.elementsRect;
  }

  public getWidth(): number {
    if (this.curveColumn) {
      return this.curveColumn.getGroupWidth();
    } else {
      return this.elementsRect.width;
    }
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

  public getFirstCurve(): CaratCurveModel | null {
    if (!this.curveColumn) return null;
    const curveGroups = this.curveColumn.getGroups();
    return curveGroups[0]?.elements[0] ?? null;
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

    this.elementsRect.width = width;
    for (const column of this.columns) column.rect.width = width;
    return width;
  }

  public setHeight(height: number) {
    const columnHeight = height - this.header.getHeight();
    this.elementsRect.height = columnHeight;
    for (const column of this.columns) column.rect.height = columnHeight;
    if (this.curveColumn) this.curveColumn.setHeight(columnHeight);
  }

  public setHeaderHeight(height: number) {
    const delta = height - this.header.getHeight();
    this.header.setHeight(height);
    this.elementsRect.top += delta;
    this.elementsRect.height -= delta;

    const elementsHeight = this.elementsRect.height;
    for (const column of this.columns) column.rect.height = elementsHeight;
    if (this.curveColumn) this.curveColumn.setHeight(elementsHeight);
  }

  public shift(by: number) {
    this.elementsRect.left += by;
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
    p.x -= this.elementsRect.left;
    p.y -= this.elementsRect.top;

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

  public setChannelData(channelData: ChannelDict) {
    for (const column of this.columns) {
      const data = channelData[column.channel.name]?.data;
      column.setChannelData(data);
    }
    if (this.curveColumn) this.curveColumn.setCurveData([], this.zones);
  }

  /** Группирует кривые по зонам, возвращает изменение ширины. */
  private groupCurves(curves: CaratCurveModel[]): number {
    this.curveColumn.setCurveData(curves, this.zones);
    this.header.setAxes(this.curveColumn.getGroups());

    const oldWidth = this.elementsRect.width;
    const newWidth = this.curveColumn.getTotalWidth();

    if (oldWidth !== newWidth) {
      this.elementsRect.width = newWidth;
      for (const column of this.columns) column.rect.width = newWidth;
    }
    return newWidth - oldWidth;
  }

  /** Задаёт новый список кривых, возвращает изменение ширины. */
  public async setCurveData(channelData: ChannelDict): Promise<number> {
    if (!this.curveColumn) return 0;
    const curveSet = channelData[this.curveColumn.curveSetChannel.name];
    this.curveManager.setCurveChannelData(curveSet.data);
    const curves = this.curveManager.getVisibleCurves();
    await this.curveManager.loadCurveData(curves.map(curve => curve.id));
    return this.groupCurves(curves);
  }

  public setLookupData(lookupData: ChannelDict) {
    for (const column of this.columns) column.setLookupData(lookupData);
    if (this.curveColumn) this.curveManager.setStyleData(lookupData);
  }

  public renderHeader() {
    this.drawer.setCurrentGroup(this.elementsRect, this.settings);
    this.header.render(this.xAxis);
  }

  public renderContent() {
    this.drawer.setCurrentGroup(this.elementsRect, this.settings);
    for (const column of this.columns) column.render();

    const curveAxes = this.header.getCurveAxes();
    if (curveAxes.length && this.xAxis.grid) this.drawer.drawVerticalGrid(this.xAxis, curveAxes);
    if (this.curveColumn) this.curveColumn.render();

    if (this.yAxis.show) this.drawer.drawGroupYAxis(this.yAxis);
    this.drawer.drawGroupBody(this.active);
  }
}
