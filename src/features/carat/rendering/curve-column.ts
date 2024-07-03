import type { CaratColumnInit, CaratColumnXAxis } from '../lib/dto.types';
import type { CaratCurveModel, CurveGroupState } from '../lib/types';
import { CaratDrawer } from './drawer';
import { CurveManager } from '../lib/curve-manager';


/** Колонка каротажной диаграммы с кривыми. */
export class CaratCurveColumn implements ICaratColumn {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник колонки. */
  public readonly rect: Rectangle;
  /** Подключённый канал со списком кривых. */
  public readonly channel: AttachedChannel;
  /** Является ли колонка видимой. */
  public visible: boolean;

  /** Выборки кривых. */
  public readonly curveManager: CurveManager;
  /** Настройки горизонтальной оси. */
  public xAxis: CaratColumnXAxis;
  /** Группы кривых по зонам. */
  private groups: CurveGroupState[];
  /** Координаты по X разделительных линий зон. */
  private dividingLines: number[];

  constructor(rect: Rectangle, drawer: CaratDrawer, channel: AttachedChannel, init: CaratColumnInit) {
    this.drawer = drawer;
    this.rect = rect;
    this.channel = channel;
    this.visible = true;
    this.xAxis = init.xAxis;
    this.curveManager = new CurveManager(init.selection, init.measures);
    this.curveManager.setChannel(channel);
    this.groups = [{rect, elements: []}];
    this.dividingLines = [];
  }

  public copy(): CaratCurveColumn {
    const copy: any = {...this, curveManager: this.curveManager.copy()};
    copy.rect = {...this.rect};
    copy.groups = [{rect: this.groups[0].rect, elements: []}];
    copy.dividingLines = [];
    Object.setPrototypeOf(copy, CaratCurveColumn.prototype);
    return copy as CaratCurveColumn;
  }

  public getRange(): [number, number] {
    let min = Infinity;
    let max = -Infinity;

    for (const curveGroup of this.groups) {
      for (const { top, bottom } of curveGroup.elements) {
        if (top < min) min = top;
        if (bottom > max) max = bottom;
      }
    }
    return [min, max];
  }

  public getLookupNames(): ChannelName[] {
    const colorLookup = this.channel.info.type.lookups.color;
    return colorLookup ? [colorLookup.name] : [];
  }

  public getGroups(): CurveGroupState[] {
    return this.groups;
  }

  public getGroupWidth(): number {
    return this.groups[0].rect.width;
  }

  public getTotalWidth(): number {
    return this.groups[0].rect.width * this.groups.length;
  }

  public setGroupWidth(width: number): void {
    for (let i = 0; i < this.groups.length; ++i) {
      const left = i * width;
      const rect = this.groups[i].rect;
      rect.left = left; rect.width = width;
      if (i > 0) this.dividingLines[i - 1] = left;
    }
    this.rect.width = this.getTotalWidth();
  }

  public setHeight(height: number): void {
    for (const curveGroup of this.groups) {
      curveGroup.rect.height = height;
    }
  }

  public setChannelData(): void {
    // данные обновляются в методе setCurveData
  }

  public setCurveData(curves: CaratCurveModel[], zones: CaratZone[]): void {
    let curveGroups: CaratCurveModel[][] = [];
    for (let i = 0; i <= zones.length; ++i) curveGroups.push([]);

    for (const curve of curves) {
      const curveType = curve.type;
      let zoneIndex = zones.findIndex((zone) => zone.types.some((type) => curveType.startsWith(type)));
      if (zoneIndex === -1) zoneIndex = zones.length;
      curveGroups[zoneIndex].push(curve);
    }

    curveGroups = curveGroups.filter(group => group.length);
    if (curveGroups.length === 0) {
      this.groups = [{rect: this.groups[0].rect, elements: []}];
      return;
    }

    const { top, width, height } = this.groups[0].rect;
    this.groups = [];
    this.dividingLines = [];

    for (let i = 0; i < curveGroups.length; ++i) {
      const rect: Rectangle = {top, left: i * width, width, height};
      this.groups.push({rect, elements: curveGroups[i]});
      if (i > 0) this.dividingLines.push(rect.left);
    }
    this.rect.width = this.getTotalWidth();
  }

  public setLookupData(lookupData: ChannelRecordDict): void {
    this.curveManager.setStyleData(lookupData);
  }

  public render(): void {
    if (this.xAxis.grid) {
      this.drawer.drawVerticalGrid(this.groups, this.xAxis);
    }
    if (this.dividingLines.length) {
      this.drawer.drawZoneDividingLines(this.dividingLines);
    }
    for (const curveGroup of this.groups) {
      this.drawer.setCurrentColumn(curveGroup.rect);
      this.drawer.drawCurves(curveGroup.elements);
      this.drawer.restore();
    }
  }
}
