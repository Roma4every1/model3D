import { CaratCurveModel } from './types.ts';


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
  public parts: ConstructionPart[];
  public coords: number[];
  public step: number;

  /** @param elements **непустой** массив элементов конструкции */
  public setConstructionElements(elements: ICaratInterval[]): void {
    this.createParts(elements);
    const count = this.parts.length;
    this.step = Math.round((this.parts[count - 1].bottom - this.parts[0].top) / count);

    let y = 0;
    for (let i = 0; i < count; i++) {
      const part = this.parts[i];
      part.tTop = y;
      part.tBottom = y + this.step;
      y += this.step;
    }
  }

  /** Высота всей конструкции: расстояние от начала первого до конца последнего элемента. */
  public getConstructionHeight(): number {
    return this.parts[this.parts.length - 1].bottom - this.parts[0].top;
  }

  /** Преобразует интервальные элементы для режима показа конструкции. */
  public transformIntervals(elements: ICaratInterval[]): void {
    for (const element of elements) {
      element.top = this.yTransform(element.top);
      element.bottom = this.yTransform(element.bottom);
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
