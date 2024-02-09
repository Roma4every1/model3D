import { CaratColumnGroup } from '../rendering/column-group.ts';
import { WellBoreColumn } from '../rendering/well-bore-column.ts';
import { WellFaceColumn } from '../rendering/face-column.ts';
import { PumpColumn } from '../rendering/pump-column.ts';
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
  public anchorPoints: CaratAnchorPoint[];
  /** Шаг выравнивания: равен высоте одной части. */
  public step: number;
  /** Высота всей конструкции: расстояние от начала первого до конца последнего элемента. */
  public constructionHeight: number;

  public setConstructionElements(groups: CaratColumnGroup[]): void {
    this.createParts(groups);
    const count = this.parts.length;
    this.constructionHeight = this.parts[count - 1].bottom - this.parts[0].top;
    this.step = this.constructionHeight / count;

    let y = 0;
    this.anchorPoints = [{y: 0, ty: 0}];

    for (const part of this.parts) {
      part.tTop = Math.round(y);
      y += this.step;
      part.tBottom = Math.round(y);
      this.anchorPoints.push({y: part.bottom, ty: part.tBottom})
    }
  }

  private createParts(groups: CaratColumnGroup[]): void {
    let maxFaceBottom = -Infinity;
    const set = new Set<number>();
    set.add(0);

    for (const group of groups) {
      for (const column of group.getColumns()) {
        if (column instanceof WellBoreColumn || column instanceof PumpColumn) {
          for (const { top, bottom } of column.getElements()) {
            set.add(Math.round(top));
            set.add(Math.round(bottom));
          }
        } else if (column instanceof WellFaceColumn) {
          const bottom = column.getRange()[1];
          if (bottom > maxFaceBottom) maxFaceBottom = bottom;
        }
      }
    }
    if (set.size === 1) set.add(1); // нет данных: координата-заглушка
    maxFaceBottom = Math.round(maxFaceBottom);

    const parts: ConstructionPart[] = [];
    const coordinates = [...set].sort((a, b) => a - b);
    const lastIndex = coordinates.length - 1;

    if (maxFaceBottom > coordinates[lastIndex]) {
      // иногда нижняя граница забоя может оказаться ниже конца ствола
      // в этом случае нужно продлить область, чтобы забой в ней оказался
      coordinates[lastIndex] = maxFaceBottom;
    }
    for (let i = 0; i < lastIndex; i++) {
      parts.push({top: coordinates[i], bottom: coordinates[i + 1], tTop: 0, tBottom: 0});
    }
    this.parts = parts;
  }

  public transformGroups(groups: CaratColumnGroup[], backgroundGroup: CaratColumnGroup): void {
    for (const group of groups) {
      for (const column of group.getColumns()) {
        if (column instanceof WellBoreColumn) {
          this.transformWellBoreElements(column.getElements());
        } else {
          this.transformIntervals(column.getElements());
        }
      }
      if (group.hasCurveColumn()) {
        this.transformCurves(group.curveManager.getVisibleCurves());
      }
    }
    for (const column of backgroundGroup.getColumns()) {
      this.transformIntervals(column.getElements());
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

  /** Преобразует интервальные элементы для режима показа конструкции. */
  private transformIntervals(elements: ICaratInterval[]): void {
    for (const element of elements) {
      element.top = this.yTransform(element.top);
      element.bottom = this.yTransform(element.bottom);
    }
  }

  /** Преобразует элементы ствола скважины для режима показа конструкции. */
  private transformWellBoreElements(elements: WellBoreElementModel[]): void {
    for (const element of elements) {
      element.top = this.yTransform(element.top);
      element.bottom = this.yTransform(element.bottom);
      if (element.cement !== null) element.cement = this.yTransform(element.cement);
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
}
