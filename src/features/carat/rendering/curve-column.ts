import { CaratDrawer } from './drawer';
import { CaratCurveModel } from '../lib/types';


interface CurveGroupState {
  rect: BoundingRect,
  elements: CaratCurveModel[],
}


/** Колонка каротажной диаграммы с кривыми. */
export class CaratCurveColumn implements ICaratColumn {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Подключённый канал со списком кривых. */
  public readonly curveSetChannel: CaratAttachedChannel;
  /** Подключённый канал с данными кривых. */
  public readonly curveDataChannel: CaratAttachedChannel;

  /** Группы кривых по зонам. */
  private groups: CurveGroupState[];
  /** Координаты по X разделительных линий зон. */
  private dividingLines: number[];

  constructor(
    rect: BoundingRect, drawer: CaratDrawer,
    curveSetChannel: CaratAttachedChannel, curveDataChannel: CaratAttachedChannel
  ) {
    this.drawer = drawer;
    this.curveSetChannel = curveSetChannel;
    this.curveDataChannel = curveDataChannel;
    this.groups = [{rect, elements: []}];
    this.dividingLines = [];
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

  public getGroups() {
    return this.groups;
  }

  public getGroupWidth() {
    return this.groups[0].rect.width;
  }

  public getTotalWidth() {
    return this.groups[0].rect.width * this.groups.length;
  }

  public setGroupWidth(width: number) {
    for (let i = 0; i < this.groups.length; i++) {
      const left = i * width;
      const rect = this.groups[i].rect;
      rect.left = left; rect.width = width;
      if (i > 0) this.dividingLines[i - 1] = left;
    }
  }

  public setHeight(height: number) {
    for (const curveGroup of this.groups) {
      curveGroup.rect.height = height;
    }
  }

  public setCurveData(curves: CaratCurveModel[], zones: CaratZone[]) {
    let curveGroups: CaratCurveModel[][] = [];
    for (let i = 0; i <= zones.length; i++) curveGroups.push([]);

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

    for (let i = 0; i < curveGroups.length; i++) {
      const rect: BoundingRect = {top, left: i * width, width, height};
      this.groups.push({rect, elements: curveGroups[i]});
      if (i > 0) this.dividingLines.push(rect.left);
    }
  }

  public render() {
    for (const curveGroup of this.groups) {
      this.drawer.setCurrentColumn(curveGroup.rect);
      this.drawer.drawCurves(curveGroup.elements);
      this.drawer.restore();
    }
    if (this.dividingLines.length) this.drawer.drawZoneDividingLines(this.dividingLines);
  }
}
