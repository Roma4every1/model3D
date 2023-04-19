import { CaratDrawer } from './drawer';
import { CaratColumn } from './column';


/** Трек. */
export class CaratTrack implements ICaratTrack {
  /** Номер скважины трека. */
  private well: string;
  /** Список колонок. */
  private readonly columns: CaratColumn[];
  /** Колонка типа `background`. */
  private readonly backgroundColumn: CaratColumn;

  /** Отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Ограничивающий прямоугольник. */
  private readonly rect: BoundingRect;
  /** Порт просмотра трека. */
  private readonly viewport: CaratViewport;

  constructor(columns: CaratColumnInit[], viewport: CaratViewport, drawer: CaratDrawer) {
    this.columns = [];
    this.drawer = drawer;
    this.viewport = viewport;

    let trackWidth = 760;
    const trackMargin = drawer.trackBodySettings.margin;

    for (const column of columns) {
      const { type, width } = column.settings;

      if (type === 'normal') {
        trackWidth += width;
        for (const channel of column.channels) {
          this.columns.push(new CaratColumn(column, drawer));
        }
      } else if (type === 'background') {
        this.backgroundColumn = new CaratColumn(column, drawer);
      }
    }

    this.rect = {
      top: trackMargin, left: trackMargin,
      bottom: 500 + trackMargin, right: trackWidth + trackMargin,
      width: trackWidth, height: 500,
    };
  }

  public getColumns(): CaratColumn[] {
    return this.columns;
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

  public setViewportScale(scale: number) {

  }

  public setActiveColumn(idx: number) {

  }

  public handleMouseDown(x: number, y: number) {

  }

  public render() {
    this.drawer.drawTrackBody(this.rect, this.well);
    for (const column of this.columns) column.render();
  }
}
