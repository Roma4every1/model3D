import { CurveAxisGroup, CurveGroupState } from '../lib/types';
import { CaratDrawer } from './drawer';


/** Заголовок колонки диаграммы. */
export class CaratColumnHeader {
  /** Ссылка на отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Высота текста названия. */
  private readonly labelTextHeight: number;
  /** Горизонатльные оси для кривых. */
  private curveAxes: CurveAxisGroup[];

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

    this.padding = 0;
    this.labelHeight = label ? this.labelTextHeight : 0;
    this.axesHeight = 0;
    this.totalHeight = this.labelHeight;
  }

  /** Горизонтальные оси. */
  public getCurveAxes(): CurveAxisGroup[] {
    return this.curveAxes;
  }

  /** Общая высота заголовка. */
  public getHeight() {
    return this.totalHeight;
  }

  /** Высота осей и названия. */
  public getContentHeight() {
    return this.labelHeight + this.axesHeight;
  }

  /** Установит значение подписи и высоту подписи. */
  public setLabel(label: string) {
    this.labelHeight = label ? this.labelTextHeight : 0;
  }

  /** Установит оси и их высоту. */
  public setAxes(curveGroups: CurveGroupState[]) {
    this.curveAxes = [];
    let maxHeight = 0;
    const { axisHeight, gap } = this.drawer.columnXAxesSettings;

    for (const { elements, rect } of curveGroups) {
      const height = (axisHeight + gap) * elements.length + gap;
      if (height > maxHeight) maxHeight = height;

      const axisRect = {top: 0, left: rect.left, width: rect.width, height: 0};
      this.curveAxes.push({rect: axisRect, axes: [...elements]});
    }
    for (const axisGroup of this.curveAxes) {
      axisGroup.axes.reverse();
      axisGroup.rect.height = maxHeight;
    }
    this.axesHeight = maxHeight;
  }

  /** Установит общую высоту заголовка. */
  public setHeight(height: number) {
    this.totalHeight = height;
    this.padding = height - (this.labelHeight + this.axesHeight);

    const axesTop = height - this.axesHeight;
    this.curveAxes.forEach((group) => { group.rect.top = axesTop; })
  }

  /** Установит ширину группы осей. */
  public setGroupWidth(width: number) {
    for (let i = 0; i < this.curveAxes.length; i++) {
      const left = i * width;
      const rect = this.curveAxes[i].rect;
      rect.left = left; rect.width = width;
    }
  }

  /** Отрисовка заголовка. */
  public render(settings: CaratColumnXAxis) {
    if (this.labelHeight) this.drawer.drawGroupLabel(this.padding);
    if (this.curveAxes.length) this.drawer.drawGroupXAxes(settings, this.curveAxes);
  }
}
