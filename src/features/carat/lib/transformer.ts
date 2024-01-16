import { CaratCurveModel, WellBoreElementModel } from './types.ts';


export interface ConstructionPart {
  /** Исходная координата верхней границы. */
  top: number;
  /** Исходная координата нижней границы. */
  bottom: number;
  /** Трансформированная координата верхней границы. */
  tTop: number;
  /** Трансформированная координата нижней границы. */
  tBottom: number;
}


/** Вспомогательный класс для трансформации координат при показе конструкции скважины. */
export class ConstructionTransformer implements IConstructionTransformer {
  /** Части конструкции скважины по котором производится выравнивание. */
  public parts: ConstructionPart[];
  /** Опорные точки частей конструкции. */
  public coords: number[];
  /** Шаг выравнивания: равен высоте одной части. */
  public step: number;
  /** Высота всей конструкции: расстояние от начала первого до конца последнего элемента. */
  public constructionHeight: number;

  /** @param elements **непустой** массив элементов конструкции */
  public setConstructionElements(elements: ICaratInterval[]): void {
    this.createParts(elements);
    const count = this.parts.length;
    this.constructionHeight = this.parts[count - 1].bottom - this.parts[0].top;
    this.step = Math.round(this.constructionHeight / count);

    let y = 0;
    for (let i = 0; i < count; i++) {
      const part = this.parts[i];
      part.tTop = y;
      part.tBottom = y + this.step;
      y += this.step;
    }
  }

  /** Преобразует интервальные элементы для режима показа конструкции. */
  public transformIntervals(elements: ICaratInterval[]): void {
    for (const element of elements) {
      element.top = this.yTransform(element.top);
      element.bottom = this.yTransform(element.bottom);
    }
  }

  /** Преобразует элементы ствола скважины для режима показа конструкции. */
  public transformWellBoreElements(elements: WellBoreElementModel[]): void {
    for (const element of elements) {
      element.top = this.yTransform(element.top);
      element.bottom = this.yTransform(element.bottom);
      element.cement = this.yTransform(element.cement);
    }
  }

  /** Преобразует каротажные кривые для режима показа конструкции. */
  public transformCurves(curves: CaratCurveModel[]): void {
    for (const curve of curves) {
      if (curve.transformed) continue;
      const path = new Path2D();
      const points = curve.points;

      const first = points[0];
      first.y = this.yTransform(first.y);
      path.moveTo(first.x, first.y);

      for (let i = 1; i < points.length; i++) {
        const point = points[i];
        point.y = this.yTransform(point.y);
        path.lineTo(point.x, point.y);
      }
      curve.path = path;
      curve.transformed = true;
    }
  }

  private yTransform(y: number): number {
    let part: ConstructionPart;
    // поиск отрезка, которому принадлежит координата
    for (const p of this.parts) {
      if (y <= p.bottom) { part = p; break; }
    }
    if (!part) return y;
    // относительное расстояние в рамках отрезка: 0 - начало, 0.5 - середина, 1 - конец
    const relativeDistance = (y - part.top) / (part.bottom - part.top);
    return part.tTop + this.step * relativeDistance;
  }

  private createParts(elements: ICaratInterval[]): void {
    const set = new Set<number>();
    set.add(0);

    for (const { top, bottom } of elements) {
      set.add(Math.round(top));
      set.add(Math.round(bottom));
    }

    const parts: ConstructionPart[] = [];
    const coordinates = [...set].sort((a, b) => a - b);

    for (let i = 0; i < coordinates.length - 1; i++) {
      parts.push({top: coordinates[i], bottom: coordinates[i + 1], tTop: 0, tBottom: 0});
    }
    this.coords = coordinates;
    this.parts = parts;
  }
}
