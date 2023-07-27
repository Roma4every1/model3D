import { CaratDrawer } from './drawer';
import { CaratCurveModel } from '../lib/types';
import { CaratColumnGroup } from './column-group';
import { CaratInclinometry } from '../lib/inclinometry';
import { isRectInnerPoint } from 'shared/lib';
import { defaultSettings } from '../lib/constants';


/** Трек. */
export class CaratTrack implements ICaratTrack {
  /** Отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник. */
  public readonly rect: Rectangle;
  /** Порт просмотра трека. */
  public readonly viewport: CaratViewport;
  /** Инклинометрия скважины. */
  public readonly inclinometry: CaratInclinometry;

  /** Является ли трек активным. */
  public active: boolean;
  /** Список колонок. */
  private readonly groups: CaratColumnGroup[];
  /** Колонка типа `background`. */
  private readonly backgroundGroup: CaratColumnGroup;

  /** Название скважины трека. */
  public wellName: WellName;
  /** Подпись трека. */
  private label: string;
  /** Высота заголовков групп колонок. */
  public maxGroupHeaderHeight: number;
  /** Индекс активной группы. */
  private activeIndex: number;
  /** Активная кривая. */
  private activeCurve: CaratCurveModel | null;

  constructor(rect: Rectangle, columns: CaratColumnInit[], scale: number, drawer: CaratDrawer) {
    this.active = false;
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
    this.viewport = {y: 0, height: 0, min: 0, max: 0, scale, scroll};

    let x = 0, index = 0;
    const top = drawer.trackHeaderSettings.height;
    const height = rect.height - top;

    for (const column of columns) {
      if (!this.inclinometry) {
        const channel = column.channels.find(c => c.type === 'inclinometry');
        if (channel) this.inclinometry = new CaratInclinometry(channel.inclinometry);
      }

      let { type, width } = column.settings;
      if (type === 'normal') {
        const groupRect = {top, left: x, width, height};
        this.groups.push(new CaratColumnGroup(groupRect, drawer, column));
        if (column.active) this.activeIndex = index;
        x += width; index += 1;
      } else if (type === 'background') {
        const groupRect = {top, left: 0, height, width: rect.width};
        this.backgroundGroup = new CaratColumnGroup(groupRect, drawer, column);
      }
    }
  }

  public cloneFor(rect: Rectangle, wellName: WellName): CaratTrack {
    const groups = this.groups.map(g => g.cloneFor(rect));
    groups.forEach(g => g.active = false);
    groups[0].active = true;

    const scroll = {queue: [], direction: 0, step: this.viewport.scroll.step, id: null};
    const viewport = {y: 0, height: 0, min: 0, max: 0, scale: this.viewport.scale, scroll};

    const copy: CaratTrack = {
      drawer: this.drawer,
      groups: groups,
      backgroundGroup: this.backgroundGroup.cloneFor(rect),
      wellName: wellName,
      label: wellName,
      maxGroupHeaderHeight: 0,
      activeIndex: 0,
      activeCurve: null,
      rect: rect,
      viewport: viewport,
      inclinometry: this.inclinometry ? new CaratInclinometry(this.inclinometry.channel) : null,
    } as any;

    Object.setPrototypeOf(copy, CaratTrack.prototype);
    copy.rebuildHeaders();
    return copy;
  }

  public getInitColumns(): CaratColumnInit[] {
    const init = this.groups.map(g => g.getInit());
    init.push(this.backgroundGroup.getInit());
    return init;
  }

  /** Возвращает список справочников, необходимых для отрисовки. */
  public getLookupNames(): ChannelName[] {
    const names: ChannelName[] = [];
    for (const group of this.groups) {
      names.push(...group.getLookupNames());
    }
    return [...new Set(names)];
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
      this.label = `${this.wellName} ${curve.type} (${top} - ${bottom})`;
    } else {
      this.label = this.wellName;
    }
  }

  public setScale(scale: number) {
    const viewport = this.viewport;
    viewport.scale = scale;

    const elementsHeight = this.backgroundGroup.getDataRect().height;
    viewport.height = elementsHeight / (scale * window.devicePixelRatio);

    if (viewport.y + viewport.height > viewport.max) {
      viewport.y = viewport.max - viewport.height;
    }
  }

  public setActiveGroup(idx: number) {
    if (idx < 0 && idx >= this.groups.length) return;
    this.groups.forEach((group) => { group.active = false; });
    this.groups[idx].active = true;
    this.activeIndex = idx;
  }

  public setGroupWidth(idx: number, width: number) {
    const group = this.groups[idx];
    if (!group) return;

    const oldWidth = group.getDataRect().width;
    const newWidth = group.setWidth(width);
    const delta = newWidth - oldWidth;

    for (let i = this.activeIndex + 1; i < this.groups.length; i++) {
      this.groups[i].shift(delta);
    }
    this.rect.width += delta;
    this.backgroundGroup.setWidth(this.rect.width);
  }

  public setGroupLabel(idx: number, label: string) {
    const group = this.groups[idx];
    if (!group) return;
    group.setLabel(label);
    this.rebuildHeaders();
  }

  public setGroupYAxisStep(idx: number, step: number) {
    const group = this.groups[idx];
    if (!group) return;
    group.yAxis.step = step;
    const groupWithYAxis = this.groups.find(group => group.yAxis?.show);
    this.viewport.scroll.step = groupWithYAxis?.yAxis.step ?? defaultSettings.yAxisStep;
  }

  public setActiveCurve(curve: CaratCurveModel | null) {
    this.activeCurve = curve;
    const id = curve?.id;
    this.groups.forEach(group => group.setActiveCurve(id));
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
    movedGroup.shift(k * relatedGroup.getDataRect().width);
    relatedGroup.settings.index = idx;
    relatedGroup.shift(-k * movedGroup.getDataRect().width);

    this.groups[idx] = relatedGroup;
    this.groups[relatedIndex] = movedGroup;
    if (idx === this.activeIndex) this.activeIndex = relatedIndex;
  }

  public handleMouseDown(point: Point): CaratCurveModel | undefined {
    point.x -= this.rect.left;
    point.y -= this.rect.top;

    const findFn = (group) => isRectInnerPoint(point, group.getDataRect())
    const newActiveIndex = this.groups.findIndex(findFn);
    if (newActiveIndex !== -1) this.setActiveGroup(newActiveIndex);

    for (const group of this.groups) {
      const nearCurve = group.getNearCurve(point, this.viewport);
      if (nearCurve) { this.setActiveCurve(nearCurve); return nearCurve; }
    }
  }

  public setData(data: ChannelRecordDict, cache: CurveDataCache) {
    const viewport = this.viewport;
    this.backgroundGroup.setData(data, cache);
    [viewport.min, viewport.max] = this.backgroundGroup.getRange();
    viewport.y = viewport.min;
    this.setActiveCurve(null);

    const changes = this.groups.map(group => {
      const widthChange = group.setData(data, cache);
      const [groupMin, groupMax] = group.getRange();
      if (groupMin < viewport.min) viewport.min = groupMin;
      if (groupMax > viewport.max) viewport.max = groupMax;
      return widthChange;
    });

    this.rebuildRects(changes);
    this.rebuildHeaders();

    if (viewport.min === Infinity) viewport.min = 0;
    if (viewport.max === -Infinity) viewport.max = 0;
    if (viewport.y === Infinity) viewport.y = viewport.min;

    if (this.inclinometry) {
      this.inclinometry.setData(data);
      this.inclinometry.updateMarks(viewport);
    }
  }

  private rebuildHeaders() {
    const maxHeight = Math.max(...this.groups.map(g => g.header.getContentHeight()));
    for (const group of this.groups) group.setHeaderHeight(maxHeight);
    this.backgroundGroup.setHeaderHeight(maxHeight);
    this.maxGroupHeaderHeight = maxHeight;
  }

  public rebuildRects(changes: number[]): void {
    for (let i = 0; i < changes.length; i++) {
      const widthDelta = changes[i];
      if (widthDelta !== 0) {
        for (let j = i + 1; j < this.groups.length; j++) {
          this.groups[j].shift(widthDelta);
        }
        this.rect.width += widthDelta;
      }
    }
    this.backgroundGroup.setWidth(this.rect.width);
  }

  public setLookupData(lookupData: ChannelRecordDict) {
    this.backgroundGroup.setLookupData(lookupData);
    for (const group of this.groups) group.setLookupData(lookupData);
  }

  public setHeight(height: number) {
    this.rect.height = height;
    const groupHeight = height - this.drawer.trackHeaderSettings.height;
    for (const group of this.groups) group.setHeight(groupHeight);
    this.backgroundGroup.setHeight(groupHeight);
    this.setScale(this.viewport.scale);
  }

  public render() {
    if (this.rect.width <= 0) return;
    this.drawer.setCurrentTrack(this.rect, this.viewport, this.inclinometry);
    this.backgroundGroup.renderContent();

    for (const group of this.groups) {
      if (group.active || group.settings.width <= 0) continue;
      group.renderHeader();
      group.renderContent();
    }
    if (this.activeIndex !== -1) {
      const group = this.groups[this.activeIndex];
      if (group.settings.width > 0) {
        group.renderHeader();
        group.renderContent();
      }
    }
    this.drawer.drawTrackBody(this.label, this.active);
  }

  public lazyRender() {
    if (this.rect.width <= 0) return;
    this.drawer.setCurrentTrack(this.rect, this.viewport, this.inclinometry);
    this.drawer.clearTrackElementRect(this.maxGroupHeaderHeight);
    this.backgroundGroup.renderContent();

    for (const group of this.groups) {
      if (!group.active && group.settings.width > 0) group.renderContent();
    }
    const group = this.groups[this.activeIndex];
    if (group && group.settings.width > 0) group.renderContent();
  }
}
