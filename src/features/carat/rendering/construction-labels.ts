import type { ConstructionLabel } from '../lib/construction.types';
import { CaratDrawer } from './drawer';
import { CaratColumnGroup } from './column-group';
import { measureText, splitByWidth } from 'shared/drawing';


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
  /** Шрифт подписей. */
  private readonly font: string;
  /** Минимальная ширина колонки, при которой подписи будут рисоваться. */
  private readonly minGroupWidth: number;

  constructor(drawer: CaratDrawer, labelGroup: CaratColumnGroup) {
    this.drawer = drawer;
    this.labelGroup = labelGroup;
    this.labels = [];

    const { labelMargin, labelPadding } = this.drawer.constructionSettings;
    const freeSpaceWidth = 2 * (labelMargin + labelPadding);
    this.maxWidth = this.labelGroup.getWidth() - freeSpaceWidth;

    this.font = drawer.constructionSettings.labelFont;
    this.minGroupWidth = measureText('_', this.font) + freeSpaceWidth;
  }

  public updateData(): void {
    this.labels = [];
    if (!this.dataGroup) return;

    for (const column of this.dataGroup.getColumns()) {
      if (!column.visible) continue;
      const type = column.channel.type as CaratChannelType;
      if (type !== 'bore' && type !== 'image' && type !== 'face') continue;

      for (const element of column.getElements()) {
        if (!element.label) continue;
        const y = (element.top + element.bottom) / 2;
        const text = element.label.trim().replaceAll(/\s+/g, ' ');
        const lines = splitByWidth(text, this.font, this.maxWidth);
        const label: ConstructionLabel = {y, text, lines, shift: 0};

        if (type === 'bore') {
          label.shift = (element.innerDiameter + element.outerDiameter) / 4;
        } else if (type === 'face') {
          label.shift = element.diameter / 2;
        }
        this.labels.push(label);
      }
    }
    this.labels.sort((a, b) => a.y - b.y);
  }

  public updateMaxWidth(): void {
    if (this.labelGroup.settings.width < this.minGroupWidth) return;
    const { labelMargin, labelPadding } = this.drawer.constructionSettings;
    this.maxWidth = this.labelGroup.getWidth() - 2 * (labelMargin + labelPadding);

    for (const label of this.labels) {
      label.lines = splitByWidth(label.text, this.font, this.maxWidth);
    }
  }

  public render(): void {
    if (!this.dataGroup.visible || !this.labelGroup.visible) return;
    if (!this.labels.length || this.labelGroup.settings.width < this.minGroupWidth) return;
    const dataRect = this.dataGroup.getDataRect();
    const labelRect = this.labelGroup.getDataRect();
    this.drawer.drawConstructionLabels(dataRect, labelRect, this.labels);
  }
}
