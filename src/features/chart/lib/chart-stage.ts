import type { ChartProperty, ChartAxis, ChartData, ChartLegendItem } from './chart.types';
import { ChartDataManager } from './chart-data';


/** Класс, управляющий состоянием графика. */
export class ChartStage {
  /** Тип оси X. */
  public readonly xAxisType: ChartXAxisType;
  /** Шаг по времени, если ось X имет тип даты. */
  public dateStep: ChartDateStep;

  /** Вертикальные оси. */
  public axes: ChartAxis[];
  /** Отображаемые свойства. */
  public properties: ChartProperty[];
  /** Индекс активного свойства. */
  private activeIndex: number;

  /** Подготовленный датасет. */
  private data: ChartData;
  /** Модель легенды. */
  private legend: ChartLegendItem[];

  constructor(xAxisType: ChartXAxisType) {
    this.properties = [];
    this.activeIndex = -1;
    this.xAxisType = xAxisType;
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

  public setChannelData(data: ChannelDict): void {
    const manager = new ChartDataManager(this.xAxisType, this.dateStep);
    this.data = manager.createData(this.properties, data);
    this.legend = this.getDisplayedProperties().map(createLegendItem);
  }

  public setLookupData(data: ChannelDict): void {
    // TODO
  }
}

function createLegendItem(property: ChartProperty): ChartLegendItem {
  const { id, displayType, displayName, color } = property;
  const item: ChartLegendItem = {id, type: 'line', value: displayName, color};

  if ((displayType === 'line' && !property.showPoint) || displayType === 'vertical') {
    item.type = 'plainline';
    item.payload = {strokeDasharray: property.lineDash ? '6 6' : ''};
  }
  if (displayType === 'bar') {
    item.type = 'rect';
  }
  // TODO: point type
  return item;
}
