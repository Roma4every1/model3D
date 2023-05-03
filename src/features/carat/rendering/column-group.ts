import { CaratDrawer } from './drawer';
import { CaratColumn } from './column';
import { CaratCurveColumn } from './curve-column';
import { CaratCurveModel, CurveAxisGroup } from '../lib/types';
import { CurveManager } from '../lib/curve-manager';
import {isPointNearCurve, isRectInnerPoint} from '../lib/utils';


/** Группа колонок каротажной диаграммы. */
export class CaratColumnGroup implements ICaratColumnGroup {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник для элементов. */
  private readonly elementsRect: BoundingRect;

  /** Координата по Y подписи колонки. */
  private labelBottom: number;
  /** Высота горизонтальных осей. */
  private xAxesHeight: number;
  /** Высота заголовка колонки. */
  private headerHeight: number;

  /** Идентификатор колонки. */
  public readonly id: string;
  /** Общие настройки. */
  public readonly settings: CaratColumnSettings;
  /** Выборки кривых. */
  public readonly curveManager: CurveManager;

  /** Зоны распределения каротажных кривых. */
  private zones: CaratZone[];
  /** Горизонатльные оси для кривых. */
  private curveAxes: CurveAxisGroup[];
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

  constructor(rect: BoundingRect, drawer: CaratDrawer, init: CaratColumnInit) {
    this.id = init.id;
    this.drawer = drawer;
    this.settings = init.settings;
    this.curveManager = new CurveManager(init.selection, init.measures);
    this.properties = init.properties;
    this.channels = init.channels;
    this.active = init.active;

    this.xAxis = init.xAxis;
    this.yAxis = init.yAxis;
    if (this.xAxis.numberOfMarks < 2) this.xAxis.numberOfMarks = 2;
    if (this.xAxis.numberOfMarks > 8) this.xAxis.numberOfMarks = 8;

    this.xAxesHeight = 0;
    this.headerHeight = drawer.columnLabelSettings.height;
    this.elementsRect = {...rect};
    this.elementsRect.top += this.headerHeight;
    this.elementsRect.height -= this.headerHeight;
    this.labelBottom = this.elementsRect.top;

    this.columns = [];
    this.curveColumn = null;

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
      selection: this.curveManager.getInitSelection(),
      measures: this.curveManager.getInitMeasures(),
      properties: this.properties,
      active: this.active,
    };
  }

  public getColumns(): ICaratColumn[] {
    return this.columns;
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

  public setWidth(width: number): number {
    if (this.curveColumn) {
      for (let i = 0; i < this.curveAxes.length; i++) {
        const left = i * width;
        const rect = this.curveAxes[i].rect;
        rect.left = left; rect.width = width;
      }
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

  public setHeaderHeight(headerHeight: number) {
    const delta = headerHeight - this.headerHeight;
    this.headerHeight = headerHeight;
    this.elementsRect.top += delta;
    this.elementsRect.height -= delta;
    this.labelBottom = this.elementsRect.top - this.xAxesHeight;

    for (const column of this.columns) column.rect.height = this.elementsRect.height;
    if (this.curveColumn) this.curveColumn.setHeight(this.elementsRect.height);
  }

  public shift(by: number) {
    this.elementsRect.left += by;
  }

  /** Делает перестроение зон, возвращает изменение ширины и новую высоту заголовка. */
  public setZones(zones: CaratZone[]): [number, number] {
    this.zones = zones;
    if (!this.curveColumn) return [0, this.drawer.columnLabelSettings.height];
    const curves = this.curveManager.getVisibleCurves();
    return this.groupCurves(curves);
  }

  public setActiveCurve(id?: CaratCurveID) {
    if (!this.curveColumn) return;
    this.curveManager.setActiveCurve(id);
  }

  /** X и Y в системе координат трека. */
  public getNearCurve(x: number, y: number, viewport: CaratViewport): CaratCurveModel | null {
    if (!this.curveColumn) return null;
    const groups = this.curveColumn.getGroups();
    x -= this.elementsRect.left;
    y -= this.elementsRect.top;

    for (const { rect, elements } of groups) {
      if (!isRectInnerPoint(x, y, rect)) continue;
      const groupX = x - rect.left;
      const groupY = y - rect.top;

      for (const curve of elements) {
        const px = groupX * (curve.axisMax / rect.width);
        const py = (groupY / (viewport.scale * window.devicePixelRatio)) + viewport.y;
        if (isPointNearCurve(px, py, curve)) return curve;
      }
    }
    return null;
  }

  public setChannelData(channelData: ChannelDict) {
    for (const column of this.columns) {
      const data = channelData[column.channel.name]?.data;
      column.setChannelData(data);
    }
    if (this.curveColumn) this.curveColumn.setCurveData([], this.zones);
  }

  private updateAxes(): number {
    const curveGroups = this.curveColumn.getGroups();
    const labelHeight = this.drawer.columnLabelSettings.height;
    if (curveGroups[0].elements.length === 0) { this.curveAxes = null; return labelHeight; }

    let maxHeight = 0;
    this.curveAxes = [];
    const { axisHeight, gap } = this.drawer.columnXAxesSettings;

    for (const { elements, rect } of curveGroups) {
      const height = (axisHeight + gap) * elements.length + gap;
      if (height > maxHeight) maxHeight = height;

      const axisRect = {top: labelHeight, left: rect.left, width: rect.width, height: 0};
      this.curveAxes.push({rect: axisRect, axes: [...elements]});
    }
    for (const axisGroup of this.curveAxes) {
      axisGroup.axes.reverse();
      axisGroup.rect.height = maxHeight;
    }
    this.xAxesHeight = maxHeight;
    return labelHeight + maxHeight;
  }

  /** Группирует кривые по зонам, возвращает изменение ширины и новую высоту заголовка. */
  private groupCurves(curves: CaratCurveModel[]): [number, number] {
    this.curveColumn.setCurveData(curves, this.zones);
    const newHeaderHeight = this.updateAxes();

    const oldWidth = this.elementsRect.width;
    const newWidth = this.curveColumn.getTotalWidth();

    if (oldWidth !== newWidth) {
      this.elementsRect.width = newWidth;
      for (const column of this.columns) column.rect.width = newWidth;
    }
    return [newWidth - oldWidth, newHeaderHeight];
  }

  /** Задаёт новый список кривых, возвращает изменение ширины и новую высоту заголовка. */
  public async setCurveData(channelData: ChannelDict): Promise<[number, number]> {
    if (!this.curveColumn) return [0, this.drawer.columnLabelSettings.height];
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

  public renderBody() {
    this.drawer.setCurrentGroup(this.elementsRect, this.settings);
    this.drawer.drawColumnGroupBody(this.labelBottom, this.active);
    if (this.curveAxes) this.drawer.drawColumnGroupXAxes(this.xAxis, this.curveAxes);
  }

  public renderContent() {
    this.drawer.setCurrentGroup(this.elementsRect, this.settings);
    for (const column of this.columns) column.render();
    if (this.curveColumn) this.curveColumn.render();
    if (this.yAxis.show) this.drawer.drawColumnGroupYAxis(this.yAxis);
  }
}
