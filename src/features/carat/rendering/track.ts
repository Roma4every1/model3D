import { CaratDrawer } from './drawer';
import { CaratColumnGroup } from './column-group';
import { isRectInnerPoint } from '../lib/utils';


/** Трек. */
export class CaratTrack implements ICaratTrack {
  /** Отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Список колонок. */
  private readonly groups: CaratColumnGroup[];
  /** Колонка типа `background`. */
  private backgroundGroup: CaratColumnGroup;

  /** Номер скважины трека. */
  private well: string;
  /** Высота заголовков групп колонок. */
  private groupHeadersHeight: number;
  /** Индекс активной группы. */
  private activeIndex: number;

  /** Ограничивающий прямоугольник. */
  public readonly rect: BoundingRect;
  /** Порт просмотра трека. */
  public readonly viewport: CaratViewport;

  constructor(rect: BoundingRect, columns: CaratColumnInit[], scale: number, drawer: CaratDrawer) {
    this.rect = rect;
    this.drawer = drawer;
    this.viewport = {y: 0, scale, min: 0, max: 0};
    this.groups = [];
    this.activeIndex = -1;

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
      }
    }
    this.groupHeadersHeight = 0;
  }

  public getInitColumns(): CaratColumnInit[] {
    return this.groups.map(g => g.getInit());
  }

  public getColumns(): CaratColumnGroup[] {
    return this.groups;
  }

  public getActiveGroup(): ICaratColumnGroup | null {
    if (this.activeIndex === -1) return null;
    return this.groups[this.activeIndex];
  }

  public setWell(well: string) {
    this.well = well;
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

  public setZones(zones: CaratZone[]) {
    for (const group of this.groups) group.setZones(zones);
  }

  public handleMouseDown(x: number, y: number) {
    const findFn = (group) => isRectInnerPoint(x, y, group.getElementsRect())
    const newActiveIndex = this.groups.findIndex(findFn);
    if (newActiveIndex !== -1) this.setActiveGroup(newActiveIndex);
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

  public async setCurveData(channelData: ChannelDict) {
    const deltas = await Promise.all(this.groups.map((group) => group.setCurveData(channelData)));
    for (let i = 0; i < deltas.length; i++) {
      const delta = deltas[i];
      const group = this.groups[i];

      if (delta !== 0) {
        for (let j = i + 1; j < this.groups.length; j++) {
          this.groups[j].shift(delta);
        }
        this.rect.width += delta;
      }
      const [groupMin, groupMax] = group.getCurvesRange();
      if (groupMin < this.viewport.min) this.viewport.min = groupMin;
      if (groupMax > this.viewport.max) this.viewport.max = groupMax;
    }
    this.backgroundGroup.setWidth(this.rect.width);
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
    this.groupHeadersHeight = Math.max(...this.groups.map(g => g.getElementsTop()));
  }

  public render() {
    this.drawer.setCurrentTrack(this.rect, this.viewport);
    this.backgroundGroup.renderContent();
    for (const group of this.groups) group.renderContent();
    this.drawer.drawTrackBody(this.well, this.groupHeadersHeight);

    for (let i = 0; i < this.activeIndex; i++) {
      this.groups[i].renderBody();
    }
    for (let i = this.activeIndex + 1; i < this.groups.length; i++) {
      this.groups[i].renderBody();
    }
    if (this.activeIndex !== -1) this.groups[this.activeIndex].renderBody();
  }
}
