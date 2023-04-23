import { CaratDrawer } from './drawer';
import { CaratColumnGroup, CaratColumn } from './column';


/** Трек. */
export class CaratTrack implements ICaratTrack {
  /** Номер скважины трека. */
  private well: string;
  /** Список колонок. */
  private readonly groups: CaratColumnGroup[];
  /** Колонка типа `background`. */
  private readonly backgroundColumn: CaratColumn;

  /** Отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник. */
  private readonly rect: BoundingRect;
  /** Порт просмотра трека. */
  private readonly viewport: CaratViewport;

  private readonly initColumns: CaratColumnInit[];

  constructor(
    rect: BoundingRect, columns: CaratColumnInit[],
    viewport: CaratViewport, zones: CaratZone[], drawer: CaratDrawer
  ) {
    this.rect = rect;
    this.drawer = drawer;
    this.viewport = viewport;
    this.groups = [];
    this.initColumns = columns;

    let x = rect.left;
    const top = rect.top + drawer.trackHeaderSettings.height;
    const bottom = rect.bottom;
    const height = top - bottom;

    for (const column of columns) {
      let { type, width } = column.settings;
      width = CaratDrawer.ratio * column.settings.width;
      const columnRect: BoundingRect = {top, left: x, bottom, right: x + width, width, height};

      if (type === 'normal') {
        this.groups.push(new CaratColumnGroup({...columnRect}, zones, drawer, column));
        x += width;
      } else if (type === 'background') {
        const backColumnRect = {...rect, top};
        this.backgroundColumn = new CaratColumn(backColumnRect, drawer, column.channels[0]);
      }
    }
  }

  public getInitColumns(): CaratColumnInit[] {
    return this.initColumns;
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
    for (const group of this.groups) group.setScale(scale);
  }

  public setActiveColumn(idx: number) {

  }

  public handleMouseDown(x: number, y: number) {

  }

  public setChannelData(channelData: ChannelDict) {
    this.backgroundColumn.setChannelData(channelData);
    this.groups.forEach(c => c.setChannelData(channelData));
    // let initY = Infinity;
    // for (const channelName in data) {
    //   const dataModel = data[channelName];
    //   const datum = channelData[channelName].data;
    //
    //   if (!datum?.columns) continue;
    //   if (!dataModel.applied) applyIndexesToModel(dataModel, datum.columns);
    //
    //   const intervals = getCaratIntervals(datum.rows, dataModel.info);
    //   initY = Math.min(initY, ...intervals.map(i => i.top));
    //   dataModel.data = intervals;
    // }
    // viewport.y = initY === Infinity ? 0 : initY;
  }

  public setLookupData(lookupData: ChannelDict) {

  }

  /* --- Rendering --- */

  public setHeight(height: number) {
    this.rect.height = height;
    this.rect.bottom = this.rect.top + height;

    const columnHeight = height - this.drawer.trackHeaderSettings.height;
    for (const group of this.groups) group.setHeight(columnHeight);
    this.backgroundColumn.setRect({...this.rect, top: this.rect.top + 50 + this.drawer.trackHeaderSettings.height});
  }

  public render() {
    this.drawer.clearBoundingRect(this.rect);
    this.backgroundColumn.render(this.viewport);
    for (const group of this.groups) group.render(this.viewport);
    this.drawer.drawTrackBody(this.rect, this.well);
  }
}
