import { CaratDrawer } from './drawer';
import { CaratCurveModel } from '../lib/types';
import { CaratColumnGroup } from './column-group';
import { isRectInnerPoint } from 'shared/lib';
import { defaultSettings } from '../lib/constants';


/** Трек. */
export class CaratTrack implements ICaratTrack {
  /** Отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Список колонок. */
  private readonly groups: CaratColumnGroup[];
  /** Колонка типа `background`. */
  private readonly backgroundGroup: CaratColumnGroup;
  /** Настройки корреляций. */
  private readonly externalInit: CaratColumnInit;

  /** Номер скважины трека. */
  private well: string;
  /** Подпись трека. */
  private label: string;
  /** Высота заголовков групп колонок. */
  public maxGroupHeaderHeight: number;
  /** Индекс активной группы. */
  private activeIndex: number;
  /** Активная кривая. */
  private activeCurve: CaratCurveModel | null;

  /** Ограничивающий прямоугольник. */
  public readonly rect: Rectangle;
  /** Порт просмотра трека. */
  public readonly viewport: CaratViewport;

  constructor(rect: Rectangle, columns: CaratColumnInit[], scale: number, drawer: CaratDrawer) {
    this.rect = rect;
    this.drawer = drawer;
    this.label = '';
    this.groups = [];
    this.activeIndex = -1;
    this.activeCurve = null;
    this.maxGroupHeaderHeight = 0;

    const groupWithYAxis = columns.find((group) => group.yAxis?.show);
    const step = groupWithYAxis?.yAxis.step ?? defaultSettings.yAxisStep;
    const scroll = {queue: [], direction: 0, step, id: null};
    this.viewport = {y: 0, scale, min: 0, max: 0, scroll};

    let x = 0, index = 0;
    const top = drawer.trackHeaderSettings.height;
    const height = rect.height - top;

    for (const column of columns) {
      let { type, width } = column.settings;
      if (type === 'normal') {
        const groupRect = {top, left: x, width, height};
        this.groups.push(new CaratColumnGroup(groupRect, drawer, column));
        if (column.active) this.activeIndex = index;
        x += width; index += 1;
      } else if (type === 'background') {
        const groupRect = {top, left: 0, height, width: rect.width};
        this.backgroundGroup = new CaratColumnGroup(groupRect, drawer, column);
      } else {
        this.externalInit = column;
      }
    }
  }

  public getInitColumns(): CaratColumnInit[] {
    const init = this.groups.map(g => g.getInit());
    init.push(this.backgroundGroup.getInit(), this.externalInit);
    return init;
  }

  public getGroups(): CaratColumnGroup[] {
    return this.groups;
  }

  public getBackgroundGroup(): ICaratColumnGroup {
    return this.backgroundGroup;
  }

  public getActiveGroup(): ICaratColumnGroup | null {
    if (this.activeIndex === -1) return null;
    return this.groups[this.activeIndex];
  }

  public getActiveIndex(): number {
    return this.activeIndex;
  }

  private updateLabel() {
    const curve = this.activeCurve;
    if (curve) {
      const top = Math.floor(curve.top);
      const bottom = Math.ceil(curve.bottom);
      this.label = `${this.well} ${curve.type} (${top} - ${bottom})`;
    } else {
      this.label = this.well;
    }
  }

  public setWell(well: string) {
    this.well = well;
    this.updateLabel();
  }

  public setScale(scale: number) {
    this.viewport.scale = scale;
  }

  public setActiveGroup(idx: number) {
    if (idx < 0 && idx >= this.groups.length) return;
    this.groups.forEach((group) => { group.active = false; });
    this.groups[idx].active = true;
    this.activeIndex = idx;
  }

  public setActiveGroupWidth(width: number) {
    const activeGroup = this.groups[this.activeIndex];
    if (!activeGroup || width < 10) return;

    const oldWidth = activeGroup.getElementsRect().width;
    const newWidth = activeGroup.setWidth(width);
    const delta = newWidth - oldWidth;

    for (let i = this.activeIndex + 1; i < this.groups.length; i++) {
      this.groups[i].shift(delta);
    }
    this.rect.width += delta;
    this.backgroundGroup.setWidth(this.rect.width);
  }

  public setActiveGroupLabel(label: string) {
    const activeGroup = this.groups[this.activeIndex];
    if (!activeGroup) return;
    activeGroup.setLabel(label);
    this.rebuildHeaders();
  }

  public setActiveGroupYAxisStep(step: number) {
    const activeGroup = this.groups[this.activeIndex];
    if (!activeGroup) return;
    activeGroup.yAxis.step = step;
    const groupWithYAxis = this.groups.find((group) => group.yAxis?.show);
    this.viewport.scroll.step = groupWithYAxis?.yAxis.step ?? defaultSettings.yAxisStep;
  }

  public setActiveCurve(curve: CaratCurveModel) {
    this.activeCurve = curve;
    this.groups.forEach((group) => { group.setActiveCurve(curve.id); });
    this.updateLabel();
  }

  public setZones(zones: CaratZone[]) {
    const changes = this.groups.map((group) => group.setZones(zones));
    this.rebuildRects(changes);
    this.rebuildHeaders();
  }

  public moveGroup(idx: number, to: 'left' | 'right') {
    const k = to === 'left' ? -1 : 1;
    const relatedIndex = idx + k;
    const movedGroup = this.groups[idx];
    const relatedGroup = this.groups[relatedIndex];

    movedGroup.settings.index = relatedIndex;
    movedGroup.shift(k * relatedGroup.getElementsRect().width);
    relatedGroup.settings.index = idx;
    relatedGroup.shift(-k * movedGroup.getElementsRect().width);

    this.groups[idx] = relatedGroup;
    this.groups[relatedIndex] = movedGroup;
    if (idx === this.activeIndex) this.activeIndex = relatedIndex;
  }

  public handleMouseDown(point: Point): CaratCurveModel | undefined {
    point.x -= this.rect.left;
    point.y -= this.rect.top;

    const findFn = (group) => isRectInnerPoint(point, group.getElementsRect())
    const newActiveIndex = this.groups.findIndex(findFn);
    if (newActiveIndex !== -1) this.setActiveGroup(newActiveIndex);

    for (const group of this.groups) {
      const nearCurve = group.getNearCurve(point, this.viewport);
      if (nearCurve) { this.setActiveCurve(nearCurve); return nearCurve; }
    }
  }

  public setChannelData(channelData: ChannelDict) {
    this.backgroundGroup.setChannelData(channelData);
    [this.viewport.min, this.viewport.max] = this.backgroundGroup.getElementsRange();

    for (const group of this.groups) {
      group.setChannelData(channelData);
      const [groupMin, groupMax] = group.getElementsRange();
      if (groupMin < this.viewport.min) this.viewport.min = groupMin;
      if (groupMax > this.viewport.max) this.viewport.max = groupMax;
    }

    if (this.viewport.min === Infinity) this.viewport.min = 0;
    if (this.viewport.max === -Infinity) this.viewport.max = 0;
    this.viewport.y = this.viewport.min;
  }

  private rebuildHeaders() {
    const maxHeight = Math.max(...this.groups.map((g) => g.header.getContentHeight()));
    for (const group of this.groups) group.setHeaderHeight(maxHeight);
    this.backgroundGroup.setHeaderHeight(maxHeight);
    this.maxGroupHeaderHeight = maxHeight;
  }

  private rebuildRects(changes: number[]) {
    for (let i = 0; i < changes.length; i++) {
      const widthDelta = changes[i];
      if (widthDelta !== 0) {
        for (let j = i + 1; j < this.groups.length; j++) {
          this.groups[j].shift(widthDelta);
        }
        this.rect.width += widthDelta;
      }
      const [groupMin, groupMax] = this.groups[i].getCurvesRange();
      if (groupMin < this.viewport.min) this.viewport.min = groupMin;
      if (groupMax > this.viewport.max) this.viewport.max = groupMax;
    }
    this.backgroundGroup.setWidth(this.rect.width);
  }

  public async setCurveData(channelData: ChannelDict) {
    const changes = await Promise.all(this.groups.map((group) => group.setCurveData(channelData)));
    this.rebuildRects(changes);
    this.rebuildHeaders();

    for (const group of this.groups) {
      const curve = group.getFirstCurve();
      if (curve) { this.setActiveCurve(curve); break; }
    }
    const activeCurveID = this.activeCurve?.id;
    this.groups.forEach((group) => { group.setActiveCurve(activeCurveID); })
    return this.activeCurve;
  }

  public setLookupData(lookupData: ChannelDict) {
    this.backgroundGroup.setLookupData(lookupData);
    for (const group of this.groups) group.setLookupData(lookupData);
  }

  public setHeight(height: number) {
    this.rect.height = height;
    const groupHeight = height - this.drawer.trackHeaderSettings.height;
    for (const group of this.groups) group.setHeight(groupHeight);
    this.backgroundGroup.setHeight(groupHeight);
  }

  public render() {
    this.drawer.setCurrentTrack(this.rect, this.viewport);
    this.backgroundGroup.renderContent();

    for (const group of this.groups) {
      if (group.active) continue;
      group.renderHeader();
      group.renderContent();
    }
    if (this.activeIndex !== -1) {
      const group = this.groups[this.activeIndex];
      group.renderHeader();
      group.renderContent();
    }
    this.drawer.drawTrackBody(this.label);
  }

  public lazyRender() {
    this.drawer.setCurrentTrack(this.rect, this.viewport);
    this.drawer.clearTrackElementRect(this.maxGroupHeaderHeight);
    this.backgroundGroup.renderContent();

    for (const group of this.groups) {
      if (!group.active) group.renderContent();
    }
    if (this.activeIndex !== -1) {
      this.groups[this.activeIndex].renderContent();
    }
  }
}
