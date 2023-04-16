import { CaratColumn } from './column';


interface ICaratTrack {
  render(): void
}


export class CaratTrack implements ICaratTrack {
  /** Дерево колонок. */
  private readonly tree: CaratColumn[];

  /** Порт просмотра трека. */
  private viewport: CaratViewport;
  /** Ограничивающий прямоугольник. */
  private readonly rect: BoundingRect;

  constructor(columns: CaratColumn[]) {
    this.tree = columns;
  }

  public render() {
    for (const column of this.tree) column.render();
  }
}
