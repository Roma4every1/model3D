import { CaratDrawer } from './drawer';
import { CaratColumnGroup } from './column-group';
import { getMeasurerForFont } from 'shared/lib';

import { PumpColumn } from './pump-column';
import { WellFaceColumn } from './face-column';
import { WellBoreColumn } from './well-bore-column.ts';


/** Подпись к элементу конструкции скважины. */
interface ConstructionLabel {
  /** Координата подписи по Y. */
  y: number;
  /** Смещение по X линии к подписи относительно центра колонки элемента. */
  shift: number;
  /** Текст подписи. */
  text: string;
  /** Строки текста. */
  lines: string[];
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
  /** Максимально допустимая ширина текста. */
  private maxWidth: number;
  /** Минимальная ширина колонки, при которой подписи будут рисоваться. */
  private readonly minGroupWidth: number;
  /** Измеритель ширины текста. */
  private readonly measurer: (text: string) => number;

  constructor(drawer: CaratDrawer, labelGroup: CaratColumnGroup) {
    this.drawer = drawer;
    this.labelGroup = labelGroup;
    this.labels = [];

    const { labelMargin, labelPadding } = this.drawer.constructionSettings;
    const freeSpaceWidth = 2 * (labelMargin + labelPadding);
    this.maxWidth = this.labelGroup.getWidth() - freeSpaceWidth;
    this.measurer = getMeasurerForFont(drawer.constructionSettings.labelFont);
    this.minGroupWidth = this.measurer('___') + freeSpaceWidth;
  }

  public updateData(): void {
    this.labels = [];
    if (!this.dataGroup) return;

    for (const column of this.dataGroup.getColumns()) {
      if (
        column instanceof WellBoreColumn ||
        column instanceof PumpColumn ||
        column instanceof WellFaceColumn
      ) {
        for (const element of column.getElements()) {
          if (!element.label) continue;
          const y = (element.top + element.bottom) / 2;
          const text = element.label.trim().replaceAll(/\s+/g, ' ');
          const lines = this.splitByWidth(text);
          const label: ConstructionLabel = {y, text, lines, shift: 0};

          if (column instanceof WellBoreColumn) {
            label.shift = (element.innerDiameter + element.outerDiameter) / 4;
          } else if (column instanceof WellFaceColumn) {
            label.shift = element.diameter / 2;
          }
          this.labels.push(label);
        }
      }
    }
    this.labels.sort((a, b) => a.y - b.y);
  }

  public updateMaxWidth(): void {
    if (this.labelGroup.settings.width < this.minGroupWidth) return;
    const { labelMargin, labelPadding } = this.drawer.constructionSettings;
    this.maxWidth = this.labelGroup.getWidth() - 2 * (labelMargin + labelPadding);
    for (const label of this.labels) label.lines = this.splitByWidth(label.text);
  }

  private splitByWidth(text: string): string[] {
    const noPos = Number.MAX_SAFE_INTEGER;
    const result = [];
    let currentLineBegin = 0;
    let currentLineEnd = text.indexOf(' ');
    if (currentLineEnd === -1) currentLineEnd = noPos;

    while (currentLineEnd !== noPos) {
      let space = text.indexOf(' ', currentLineEnd + 1);
      if (space === -1) space = noPos;
      let line = text.substring(currentLineBegin, space);

      if (this.measurer(line) > this.maxWidth) {
        result.push(text.substring(currentLineBegin, currentLineEnd));
        currentLineBegin = currentLineEnd + 1;
      }
      currentLineEnd = space;
    }
    result.push(text.substring(currentLineBegin, currentLineEnd));
    return result;
  }

  public render(): void {
    if (!this.labels.length || this.labelGroup.settings.width < this.minGroupWidth) return;
    const dataRect = this.dataGroup.getDataRect();
    const labelRect = this.labelGroup.getDataRect();
    this.drawer.drawConstructionLabels(dataRect, labelRect, this.labels);
  }
}
