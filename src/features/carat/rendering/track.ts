import { CaratDrawer } from './drawer';
import { CaratColumnGroup } from './column-group';


/** Трек. */
export class CaratTrack implements ICaratTrack {
  /** Номер скважины трека. */
  private well: string;
  /** Список колонок. */
  private readonly groups: CaratColumnGroup[];
  /** Колонка типа `background`. */
  private readonly backgroundGroup: CaratColumnGroup;

  /** Отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник. */
  private readonly rect: BoundingRect;
  /** Порт просмотра трека. */
  private readonly viewport: CaratViewport;

  constructor(
    rect: BoundingRect, columns: CaratColumnInit[],
    viewport: CaratViewport, zones: CaratZone[], drawer: CaratDrawer
  ) {
    this.rect = rect;
    this.drawer = drawer;
    this.viewport = viewport;
    this.groups = [];

    let x = 0;
    const top = drawer.trackHeaderSettings.height;
    const height = rect.height - top;

    for (const column of columns) {
      let { type, width } = column.settings;
      width = column.settings.width;

      if (type === 'normal') {
        const groupRect = {top, left: x, width, height};
        this.groups.push(new CaratColumnGroup(groupRect, zones, drawer, column));
        x += width;
      } else if (type === 'background') {
        const groupRect = {top, left: 0, height, width: rect.width};
        this.backgroundGroup = new CaratColumnGroup(groupRect, zones, drawer, column);
      }
    }
  }

  public getInitColumns(): CaratColumnInit[] {
    return this.groups.map(g => g.getInit());
  }

  public getColumns(): CaratColumnGroup[] {
    return this.groups;
  }

  public getViewport(): CaratViewport {
    return this.viewport;
  }
  public getRect(): BoundingRect {
    return this.rect;
  }

  public setWell(well: string) {
    this.well = well;
  }

  public setScale(scale: number) {
    this.viewport.scale = scale;
  }

  public setActiveColumn(idx: number) {

  }

  public handleMouseDown(x: number, y: number) {

  }

  public setChannelData(channelData: ChannelDict) {
    // this.backgroundColumn.setChannelData(channelData);
    this.groups.forEach(c => c.setChannelData(channelData));

    const coordinates = this.groups.map(g => g.getMinY());
    const trackMinY = Math.min(...coordinates);
    this.viewport.y = trackMinY === Infinity ? 0 : trackMinY;
  }

  public async setCurveData(channelData: ChannelDict) {
    await Promise.all(this.groups.map((group) => group.setCurveData(channelData)));
  }

  public setLookupData(lookupData: ChannelDict) {

  }

  /* --- Rendering --- */

  public setHeight(height: number) {
    this.rect.height = height;
    const groupHeight = height - this.drawer.trackHeaderSettings.height;
    for (const group of this.groups) group.setHeight(groupHeight);
    this.backgroundGroup.setHeight(groupHeight);
  }

  public render() {
    this.drawer.setCurrentTrack(this.rect, this.viewport);
    this.drawer.clearCurrentTrack();
    this.backgroundGroup.render();
    for (const group of this.groups) group.render();
    this.drawer.drawTrackBody(this.well);
  }
}
