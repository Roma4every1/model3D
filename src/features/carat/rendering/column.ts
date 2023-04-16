import { CaratDrawer } from './drawer';
import { CaratCurveAxis, CaratIntervalStyleDict } from '../lib/types';


interface ICaratColumn {
  updateData(): void
  render(): void
}


export class CaratColumn implements ICaratColumn {
  /** Крайняя левая точка колонки. */
  private left: number;
  /** Крайняя правая точка колонки. */
  private right: number;
  /** Ширина колонки. */
  private width: number;

  /** Имя колонки. */
  private name: string;
  /** Высота заголовка колонки. */
  private headerHeight: number;

  /** Горизонатльные оси для кривых. */
  private curveAxes: CaratCurveAxis[];
  /** Стиль горизонтальных осей. */
  private curveAxisStyle: CaratColumnXAxis;

  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Пласты для отрисовки. */
  private readonly elements: any[];
  /** Словарь свойств внешнего вида пластов. */
  private readonly styleDict: CaratIntervalStyleDict;

  /** Массив подключённых свойств канала. */
  private readonly properties: string[];

  constructor(drawer: CaratDrawer) {
    this.drawer = drawer;
  }

  public updateData() {

  }

  public render() {
    this.drawer.currentLeft = this.left;
    this.drawer.currentWidth = this.width;

    for (const element of this.elements) {
      this.drawer.drawElement(element);
    }
  }
}
