import type { ChartProperty, ChartAxis, ChartData, ChartLegendItem, ChartPreset } from './chart.types';
import { ChartDataController } from './chart-data';
import { createPropertyLegend } from '../components/elements/legend-item';


/** Класс, управляющий состоянием графика. */
export class ChartStage {
  /** Вертикальные оси. */
  public axes: ChartAxis[];
  /** Отображаемые свойства. */
  public properties: ChartProperty[];
  /** Индекс активного свойства. */
  private activeIndex: number;

  /** Класс для управления данными. */
  public readonly dataController: ChartDataController;
  /** Подготовленный датасет. */
  private data: ChartData;
  /** Модель легенды. */
  private legend: ChartLegendItem[];

  constructor(xAxisType: ChartXAxisType) {
    this.properties = [];
    this.activeIndex = 0;
    this.dataController = new ChartDataController(xAxisType);
    this.data = {records: [], marks: []};
    this.legend = [];
  }

  public getData(): ChartData {
    return this.data;
  }

  public getLegend(): ChartLegendItem[] {
    return this.legend;
  }

  public getDisplayedProperties(): ChartProperty[] {
    return this.properties.filter(p => p.visible && !p.empty);
  }

  public getActiveProperty(): ChartProperty | null {
    if (this.activeIndex === -1) return null;
    return this.properties[this.activeIndex];
  }

  public setActiveProperty(id: ChartPropertyID | null): void {
    if (id === null) this.activeIndex = -1;
    this.activeIndex = this.properties.findIndex(p => p.id === id);
  }

  public getDisplayedAxes(): ChartAxis[] {
    return this.axes.filter((axis: ChartAxis) => {
      return this.properties.some(p => p.yAxisID === axis.id && p.visible && !p.empty);
    });
  }

  public getActiveAxis(): ChartAxis | null {
    if (this.activeIndex === -1) return null;
    const id = this.properties[this.activeIndex].yAxisID;
    return this.axes.find(axis => axis.id === id) ?? null;
  }

  /* --- --- */

  public setChannelData(data: ChannelDict): void {
    this.dataController.setChannelData(data);
    this.updateData();
    this.updateLegend();
  }

  public setLookupData(data: ChannelDict): void {
    this.dataController.setLookupData(data);
    const marks = this.data.marks;
    if (marks.length > 0) this.dataController.updateMarks(marks);
  }

  private updateData(): void {
    this.data = this.dataController.createData(this.properties);
    this.updateDataRanges();
  }

  private updateLegend(): void {
    this.legend = this.getDisplayedProperties().map(createPropertyLegend);
  }

  private updateDataRanges(): void {
    for (const axis of this.axes) {
      const values: number[] = [];
      for (const property of this.properties) {
        if (property.yAxisID !== axis.id) continue;
        for (const record of this.data.records) {
          const value = record[property.id] as number;
          if (value !== null && value !== undefined) values.push(value);
        }
      }
      if (values.length > 0) {
        axis.actualMin = Math.min(...values);
        axis.actualMax = Math.max(...values);
      } else {
        axis.actualMin = 0;
        axis.actualMax = 0;
      }
    }
  }

  /* --- --- */

  public setPropertyPreset(id: ChartPropertyID, preset: ChartPreset): void {
    const property = this.properties.find(p => p.id === id);
    const oldType = property.displayType;

    const { displayType: newType, curveType } = preset;
    property.displayType = newType;
    if (curveType) property.curveType = curveType;

    if (oldType === 'vertical' || newType === 'vertical') {
      this.updateData();
      this.updateLegend();
    } else {
      this.updatePropertyLegend(property);
    }
  }

  public setPropertyVisibility(id: ChartPropertyID, visible: boolean): void {
    const property = this.properties.find(p => p.id === id);
    if (property.visible === visible) return;
    property.visible = visible;
    this.updateLegend();
  }

  public updatePropertyLegend(property: ChartProperty): void {
    const index = this.legend.findIndex(l => l.id === property.id);
    if (index !== -1) this.legend[index] = createPropertyLegend(property);
  }
}
