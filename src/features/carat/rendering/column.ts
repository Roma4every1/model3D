import { CaratDrawer } from './drawer';
import { CaratCurveAxis, CaratIntervalStyleDict } from '../lib/types';


/** Колонка каротажной диаграммы. */
export class CaratColumn implements ICaratColumn {
  /** Ограничивающий прямоугольник колонки. */
  private readonly rect: BoundingRect;
  /** Ограничивающий прямоугольник для элементов. */
  private readonly elementsRect: BoundingRect;

  /** Имя колонки. */
  private label: string;
  /** Высота заголовка колонки. */
  private headerHeight: number;

  /** Настройки вертикальной оси колонки. */
  private readonly yAxis: CaratColumnYAxis;

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

  constructor(rect: BoundingRect, init: CaratColumnInit, drawer: CaratDrawer) {
    this.rect = rect;
    this.drawer = drawer;
    this.label = init.settings.label;
    this.elements = [];
    this.yAxis = init.yAxis;

    this.headerHeight = 50;
    this.elementsRect = {...rect};
    this.elementsRect.top += this.headerHeight;
    this.elementsRect.height -= this.headerHeight;
  }

  public getLabel(): string {
    return this.label;
  }

  public getWidth(): number {
    return this.rect.width;
  }

  public getYAxisStep(): number {
    return this.yAxis.step;
  }

  public setLabel(label: string) {
    this.label = label;
  }

  public setWidth(width: number) {
    this.rect.width = width;
  }

  public setHeight(height: number) {
    this.rect.height = height;
    this.rect.bottom = this.rect.top + height;
    this.elementsRect.height = height - this.headerHeight;
    this.elementsRect.bottom = this.elementsRect.top + this.elementsRect.height;
  }

  public setYAxisStep(step: number) {
    this.yAxis.step = step;
  }

  public updateData() {
    // device pixel ratio используется только для элементов, то, что в пикселях - нет
  }

  public render(viewport: CaratViewport) {
    this.drawer.drawColumnBody(this.elementsRect, this.label);
    // for (const element of this.elements) this.drawer.drawElement(element);
    if (this.yAxis.show) this.drawer.drawColumnYAxis(this.elementsRect, this.yAxis, viewport);
  }
}
