import { CaratDrawer } from './drawer';
import { CaratCurveAxis, CaratIntervalStyleDict } from '../lib/types';


/** Колонка каротажной диаграммы. */
export class CaratColumn implements ICaratColumn {
  /** Крайняя левая точка колонки. */
  private left: number;
  /** Крайняя правая точка колонки. */
  private right: number;
  /** Ширина колонки. */
  private width: number;

  /** Имя колонки. */
  private label: string;
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

  constructor(init: CaratColumnInit, drawer: CaratDrawer) {
    this.drawer = drawer;
    this.elements = [];
  }

  public getLabel(): string {
    return this.label;
  }

  public getWidth(): number {
    return this.width;
  }

  public getYAxisStep(): number {
    return 0;
  }

  public setLabel(label: string) {
    this.label = label;
  }

  public setWidth(width: number) {
    this.width = width;
  }

  public setYAxisStep(step: number) {

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
