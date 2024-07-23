import type { CaratColumnXAxis } from '../lib/dto.types';
import type { CurveGroupState, CaratCurveModel } from '../lib/types';
import { CaratDrawer } from './drawer';


/** Заголовок колонки диаграммы. */
export class CaratColumnHeader {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Высота текста названия. */
  private readonly labelTextHeight: number;
  /** Горизонатльные оси для кривых. */
  private curveAxes: CurveGroupState[];
  /** Тип активной кривой. */
  private activeType: CaratCurveType | null;

  /** Отступ сверху. */
  private padding: number;
  /** Высота названия. */
  private labelHeight: number;
  /** Высота осей. */
  private axesHeight: number;
  /** Общая высота всего заголовка. */
  private totalHeight: number;

  constructor(drawer: CaratDrawer, label: string) {
    this.drawer = drawer;
    this.labelTextHeight = drawer.columnLabelSettings.height;
    this.curveAxes = [];
    this.activeType = null;

    this.padding = 0;
    this.labelHeight = label ? this.labelTextHeight : 0;
    this.axesHeight = 0;
    this.totalHeight = this.labelHeight;
  }

  /** Общая высота заголовка. */
  public getHeight(): number {
    return this.totalHeight;
  }

  /** Высота осей и названия. */
  public getContentHeight(): number {
    return this.labelHeight + this.axesHeight;
  }

  /** Задаёт подпись колонки. */
  public setLabel(label: string): void {
    this.labelHeight = label ? this.labelTextHeight : 0;
  }

  /** Задаёт тип активной кривой. */
  public setActiveType(type: CaratCurveType | null): void {
    this.activeType = type;
  }

  /** Задаёт оси кривых. */
  public setAxes(curveGroups: CurveGroupState[]): void {
    this.curveAxes = [];
    let maxHeight = 0;
    const { axisHeight, gap } = this.drawer.columnXAxisSettings;

    for (const { elements, rect } of curveGroups) {
      const axes: CaratCurveModel[] = [];
      const axisRect = {top: 0, left: rect.left, width: rect.width, height: 0};

      for (const curve of elements) {
        const type = curve.type;
        if (!axes.some(a => a.type === type)) axes.push(curve);
      }
      const height = (axisHeight + gap) * axes.length + gap;
      if (height > maxHeight) maxHeight = height;
      this.curveAxes.push({rect: axisRect, elements: axes});
    }
    for (const axisGroup of this.curveAxes) {
      axisGroup.elements.reverse();
      axisGroup.rect.height = maxHeight;
    }
    this.axesHeight = maxHeight;
  }

  /** Задаёт общую высоту заголовка. */
  public setHeight(height: number): void {
    this.totalHeight = height;
    this.padding = height - (this.labelHeight + this.axesHeight);

    const axesTop = height - this.axesHeight;
    this.curveAxes.forEach((group) => { group.rect.top = axesTop; })
  }

  /** Задаёт ширину группы осей. */
  public setGroupWidth(width: number): void {
    for (let i = 0; i < this.curveAxes.length; i++) {
      const left = i * width;
      const rect = this.curveAxes[i].rect;
      rect.left = left; rect.width = width;
    }
  }

  /** Отрисовка заголовка. */
  public render(settings: CaratColumnXAxis): void {
    if (this.labelHeight) {
      this.drawer.drawGroupLabel(this.padding);
    }
    if (this.curveAxes.length) {
      this.drawer.drawGroupXAxes(settings, this.curveAxes, this.activeType);
    }
  }
}
