import { CaratDrawer } from './drawer';
import { CaratColumnGroup } from './column-group';

import { PumpColumn } from './pump-column';
import { WellFaceColumn } from './face-column';
import { ConstructionColumn } from './construction-column';


/** Подпись к элементу конструкции скважины. */
interface ConstructionLabel {
  /** Координата подписи по Y. */
  y: number;
  /** Смещение по X линии к подписи относительно центра колонки элемента. */
  shift: number;
  /** Текст подписи. */
  text: string;
}


/** Класс, отвечающий за отображение подписей к элементам конструкции. */
export class ConstructionLabels {
  /** Отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Группа колонок, содержащая элементы конструкции. */
  public dataGroup: CaratColumnGroup;
  /** Группа колонок, в которой будут рисоваться подписи. */
  public labelGroup: CaratColumnGroup;

  /** Подписи к элементам конструкции. */
  private labels: ConstructionLabel[];

  constructor(drawer: CaratDrawer, labelGroup: CaratColumnGroup) {
    this.drawer = drawer;
    this.labelGroup = labelGroup;
    this.labels = [];
  }

  public updateData(): void {
    this.labels = [];
    if (!this.dataGroup) return;

    for (const column of this.dataGroup.getColumns()) {
      if (
        column instanceof ConstructionColumn ||
        column instanceof PumpColumn ||
        column instanceof WellFaceColumn
      ) {
        for (const element of column.getElements()) {
          if (!element.label) continue;
          const y = (element.top + element.bottom) / 2;
          const label: ConstructionLabel = {y, text: element.label, shift: 0};

          if (column instanceof ConstructionColumn) {
            label.shift = (element.innerDiameter + element.outerDiameter) / 4;
          } else if (column instanceof WellFaceColumn) {
            label.shift = element.diameter / 2;
          }
          this.labels.push(label);
        }
      }
    }
  }

  public render(): void {
    if (!this.labels.length) return;
    const dataRect = this.dataGroup.getDataRect();
    const labelRect = this.labelGroup.getDataRect();
    this.drawer.drawConstructionLabels(dataRect, labelRect, this.labels);
  }
}
