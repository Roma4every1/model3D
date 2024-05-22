import type {
  CaratColumnDTO, CaratColumnInit, CaratColumnSettings,
  CaratColumnProperties, CaratColumnXAxis, CaratColumnYAxis,
} from '../lib/dto.types';

import type { CaratCurveModel, CaratIntervalModel } from '../lib/types';
import { CaratDrawer } from './drawer';
import { CaratColumnHeader } from './column-header';
import { CaratCurveColumn } from './curve-column';
import { CaratMarkColumn } from './mark-column';
import { CaratColumnFactory, caratColumnCompareFn } from './columns';

import { isRectInnerPoint } from 'shared/lib';
import { distanceFromCaratCurve } from '../lib/utils';
import { defaultSettings, constraints } from '../lib/constants';


/** Группа колонок каротажной диаграммы. */
export class CaratColumnGroup {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник для элементов. */
  private readonly dataRect: Rectangle;
  /** Является ли колонка видимой. */
  public visible: boolean;

  /** Идентификатор колонки. */
  public readonly id: string;
  /** Общие настройки. */
  public readonly settings: CaratColumnSettings;
  /** Заголовок группы. */
  public readonly header: CaratColumnHeader;

  /** Зоны распределения каротажных кривых. */
  private zones: CaratZone[];
  /** Стиль горизонтальных осей. */
  public readonly xAxis: CaratColumnXAxis;
  /** Настройки вертикальной оси колонки. */
  public readonly yAxis: CaratColumnYAxis;

  /** Каротажные колонки в группе. */
  private readonly columns: ICaratColumn[];
  /** Каротажные колонки с кривыми. */
  private readonly curveColumn: CaratCurveColumn | null;

  private readonly channels: AttachedChannel<CaratChannelType>[];
  private readonly properties: Record<ChannelName, CaratColumnProperties>;

  public active: boolean;

  constructor(rect: Rectangle, drawer: CaratDrawer, init: CaratColumnInit) {
    this.id = init.id;
    this.drawer = drawer;
    this.settings = init.settings;
    this.header = new CaratColumnHeader(drawer, init.settings.label);
    this.properties = init.properties;
    this.channels = init.channels;
    this.active = init.active;
    this.visible = true;

    if (!init.xAxis) init.xAxis = defaultSettings.xAxis;
    this.yAxis = init.yAxis;
    this.xAxis = init.xAxis;

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

    let curveSetChannel: AttachedChannel;
    let curveDataChannel: AttachedChannel;

    const height = rect.height - headerHeight;
    const factory = new CaratColumnFactory(drawer, init);

    for (const attachedChannel of this.channels) {
      const channelType = attachedChannel.type as CaratChannelType;
      if (!channelType || channelType === 'inclinometry') continue;

      if (channelType === 'curve') { curveSetChannel = attachedChannel; continue; }
      if (channelType === 'curve-data') { curveDataChannel = attachedChannel; continue; }

      const columnRect = {top: 0, left: 0, width: rect.width, height};
      this.columns.push(factory.createColumn(attachedChannel, columnRect));
    }
    if (curveSetChannel && curveDataChannel) {
      const columnRect = {top: 0, left: 0, width: rect.width, height};
      this.curveColumn = new CaratCurveColumn(columnRect, drawer, curveSetChannel, init);
      this.columns.push(this.curveColumn);
    }
    this.columns.sort(caratColumnCompareFn);
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
      visible: this.visible,
      id: this.id,
      settings: structuredClone(this.settings),
      header: new CaratColumnHeader(this.drawer, this.settings.label),
      zones: this.zones,
      xAxis: {...this.xAxis},
      yAxis: {...this.yAxis},
      columns: this.columns.map(c => c.copy()),
      curveColumn: null,
      channels: this.channels,
      properties: this.properties,
    };

    copy.curveColumn = copy.columns.find(c => c.channel.type === 'curve') as CaratCurveColumn ?? null;
    if (copy.curveColumn) copy.curveColumn.xAxis = copy.xAxis;

    Object.setPrototypeOf(copy, CaratColumnGroup.prototype);
    return copy as any as CaratColumnGroup;
  }

  public getInit(): CaratColumnDTO {
    const dto: CaratColumnDTO = {
      id: this.id,
      settings: this.settings,
      xAxis: this.xAxis,
      yAxis: this.yAxis,
      channels: this.channels.map(c => ({name: c.name})),
      properties: this.properties,
      active: this.active,
    };
    if (this.curveColumn) {
      dto.selection = this.curveColumn.curveManager.getInitSelection();
      dto.measures = this.curveColumn.curveManager.getInitMeasures();
    }
    return dto;
  }

  /** Возвращает список названий справочников, необходимых для отрисовки. */
  public getLookupNames(): ChannelName[] {
    const names: ChannelName[] = [];
    for (const column of this.columns) names.push(...column.getLookupNames());
    return names;
  }

  public constructionMode(): boolean {
    return this.columns.some(c => c.channel.type === 'bore');
  }

  public getColumns(): ICaratColumn[] {
    return this.columns;
  }

  public getCurveColumn(): CaratCurveColumn | null {
    return this.curveColumn;
  }

  public getDataRect(): Rectangle {
    return this.dataRect;
  }

  public getStrata(id?: StratumID): CaratIntervalModel[] {
    const column = this.columns.find(c => c.channel.type === 'lithology');
    let strata = column?.getElements() ?? [];
    if (id !== undefined) strata = strata.filter(s => s.stratumID === id);
    return strata;
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
    return [min, max];
  }

  public hasCurveColumn(): boolean {
    return Boolean(this.curveColumn);
  }

  public setLabel(label: string): void {
    this.header.setLabel(label);
    this.settings.label = label;
  }

  public setWidth(width: number): void {
    this.settings.width = width;
    if (this.curveColumn) {
      this.header.setGroupWidth(width);
      this.curveColumn.setGroupWidth(width);
      width = this.curveColumn.getTotalWidth();
    }
    for (const column of this.columns) {
      column.rect.width = width;
      if (column instanceof CaratMarkColumn) column.updateBounds();
    }
    this.dataRect.width = width;
  }

  public setHeight(height: number): void {
    const columnHeight = height - this.header.getHeight();
    this.dataRect.height = columnHeight;
    for (const column of this.columns) column.rect.height = columnHeight;
    if (this.curveColumn) this.curveColumn.setHeight(columnHeight);
  }

  public setHeaderHeight(height: number): void {
    const delta = height - this.header.getHeight();
    this.header.setHeight(height);
    this.dataRect.top += delta;
    this.dataRect.height -= delta;

    const elementsHeight = this.dataRect.height;
    for (const column of this.columns) column.rect.height = elementsHeight;
    if (this.curveColumn) this.curveColumn.setHeight(elementsHeight);
  }

  public shift(by: number): void {
    this.dataRect.left += by;
  }

  public setColumnVisibility(idx: number, visibility: boolean): void {
    this.columns[idx].visible = visibility;
  }

  /** Делает перестроение зон, возвращает изменение ширины. */
  public setZones(zones: CaratZone[]): void {
    this.zones = zones;
    if (!this.curveColumn) return;
    this.groupCurves(this.curveColumn.curveManager.getVisibleCurves());
  }

  public setActiveCurve(id?: CaratCurveID): void {
    if (!this.curveColumn) return;
    this.curveColumn.curveManager.setActiveCurve(id);
  }

  /** Точка в системе координат трека. */
  public getNearCurve(p: Point, viewport: CaratViewport): CaratCurveModel | null {
    if (!this.curveColumn) return null;
    p.x -= this.dataRect.left;
    p.y -= this.dataRect.top;

    const group = this.curveColumn.getGroups().find(g => isRectInnerPoint(p, g.rect));
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
  public setData(data: ChannelRecordDict, cache: CurveDataCache): void {
    for (const column of this.columns) {
      const rows = data[column.channel.name];
      column.setChannelData(rows);
    }

    if (!this.curveColumn) return;
    const curveRecords = data[this.curveColumn.channel.name];
    this.curveColumn.curveManager.setCurveChannelData(curveRecords, cache);
    this.groupCurves(this.curveColumn.curveManager.getVisibleCurves());
  }

  /** Группирует кривые по зонам. */
  public groupCurves(curves: CaratCurveModel[]): void {
    this.curveColumn.setCurveData(curves, this.zones);
    this.header.setAxes(this.curveColumn.getGroups());

    const oldWidth = this.dataRect.width;
    const newWidth = this.curveColumn.getTotalWidth();

    if (oldWidth !== newWidth) {
      this.dataRect.width = newWidth;
      for (const column of this.columns) column.rect.width = newWidth;
    }
  }

  public setLookupData(lookupData: ChannelRecordDict): void {
    for (const column of this.columns) column.setLookupData(lookupData);
  }

  /* --- Rendering --- */

  public renderHeader(): void {
    this.drawer.setCurrentGroup(this.dataRect, this.settings);
    this.header.render(this.xAxis);
  }

  public renderContent(): void {
    this.drawer.setCurrentGroup(this.dataRect, this.settings);
    for (const column of this.columns) {
      if (column.visible) column.render();
    }
    if (this.yAxis.show) this.drawer.drawGroupYAxis(this.yAxis);
    this.drawer.drawGroupBody(this.active);
  }
}
