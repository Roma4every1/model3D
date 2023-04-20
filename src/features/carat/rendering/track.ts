import { CaratStage } from './stage';
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

  constructor(
    rect: BoundingRect, columns: CaratColumnInit[],
    viewport: CaratViewport, drawer: CaratDrawer
  ) {
    this.rect = rect;
    this.drawer = drawer;
    this.viewport = viewport;

    let x = rect.left;
    const top = rect.top + drawer.trackHeaderSettings.height;
    const bottom = rect.bottom;
    const height = top - bottom;
    this.columns = [];

    for (const column of columns) {
      const type = column.settings.type;
      const width = CaratStage.ratio * column.settings.width;
      const columnRect: BoundingRect = {top, left: x, bottom, right: x + width, width, height};

      if (type === 'normal') {
        this.columns.push(new CaratColumn({...columnRect}, column, drawer));
        x += width;
      } else if (type === 'background') {
        const backColumnRect = {...rect, top};
        this.backgroundColumn = new CaratColumn(backColumnRect, column, drawer);
      }
    }
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

  /* --- Rendering --- */

  public setHeight(height: number) {
    this.rect.height = height;
    this.rect.bottom = this.rect.top + height;

    const columnHeight = height - this.drawer.trackHeaderSettings.height;
    for (const column of this.columns) column.setHeight(columnHeight);
  }

  public render() {
    this.drawer.drawTrackBody(this.rect, this.well);
    for (const column of this.columns) column.render(this.viewport);
  }
}
