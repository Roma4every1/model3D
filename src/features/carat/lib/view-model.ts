/** Модель отображения каротажной диаграммы. */
export class CaratViewModel implements ICaratViewModel {
  private width: number;
  private height: number;

  // private readonly wellRect: BoundingRect;
  // private readonly headerRect: BoundingRect;
  // private readonly dataRect: BoundingRect;

  private readonly viewport: CaratViewport;
  private readonly columns: CaratColumnInit[];

  constructor(columns: CaratColumnInit[], viewport: CaratViewport) {
    this.columns = columns;
    this.viewport = viewport;
  }

  public getColumns(): CaratColumnInit[] {
    return this.columns;
  }

  public getViewport(): CaratViewport {
    return this.viewport;
  }

  public getColumnIndex(xCoordinate: number) {
    let x = 0, idx = 0;
    for (const column of this.columns) {
      const width = column.settings.width;
      if (xCoordinate >= x && xCoordinate <= x + width) return idx;
      x += width; idx++;
    }
    return -1;
  }

  public setActiveColumn(idx: number) {
    for (const column of this.columns) {
      if (column.active) { column.active = false; break; }
    }
    this.columns[idx].active = true;
  }

  public setColumnWidth(idx: number, width: number) {
    this.columns[idx].settings.width = width;
  }

  public setColumnLabel(idx: number, label: string) {
    this.columns[idx].settings.label = label;
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public setViewportScale(scale: number) {
    this.viewport.scale = scale;
  }
}

/** Находится ли точка внутри ограничивающего прямоугольника. */
function isRectInnerPoint(x: number, y: number, rect: BoundingRect) {
  return x >= rect.left && x <= rect.right && y >= rect.bottom && y <= rect.top;
}
