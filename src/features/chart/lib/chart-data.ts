import type { ChartProperty, ChartData, ChartDataRecord } from './chart.types';
import { monthStep, toMonYear, toYear, yearStep } from './utils';


export class ChartDataManager {
  public type: ChartXAxisType;
  private keyGetter: (date: Date) => number;
  private keyFormatter: (date: Date) => string;
  private data: Map<number, ChartDataRecord>;

  constructor(type: ChartXAxisType, dateStep: ChartDateStep) {
    this.type = type;
    this.setDateStep(dateStep);
  }

  public setDateStep(step: ChartDateStep): void {
    this.keyGetter = step === 'month' ? monthStep : yearStep;
    this.keyFormatter = step === 'month' ? toMonYear : toYear;
  }

  public createData(properties: ChartProperty[], data: ChannelDict): ChartData {
    this.data = new Map();
    const xValueMap = new Map<ChannelProperty, number[]>();

    for (const chartProperty of properties) {
      const channelData = data[chartProperty.channel.id]?.data;
      if (!channelData || channelData.rows.length === 0) continue;

      const xProperty = chartProperty.xProperty;
      let xValues = xValueMap.get(xProperty);

      if (!xValues) {
        xValues = this.getXValues(xProperty, channelData);
        xValueMap.set(xProperty, xValues);
      }
      this.setPropertyData(chartProperty, xValues, channelData);
    }
    return {records: [...this.data.values()].sort(compareDataItems), marks: []};
  }

  private getXValues(channelProperty: ChannelProperty, data: ChannelData): number[] {
    const xValues: number[] = [];
    const xIndex = data.columns.findIndex(c => c.name === channelProperty.fromColumn);

    for (const row of data.rows) {
      const cellValue = row[xIndex];
      if (cellValue === null) continue;

      const date = new Date(cellValue);
      const key = this.keyGetter(date);
      this.data.set(key, {x: this.keyFormatter(date), key: key});
      xValues.push(key);
    }
    return xValues;
  }

  private setPropertyData(property: ChartProperty, xKeys: number[], data: ChannelData): void {
    property.empty = true;
    const { rows, columns } = data;
    if (rows.length === 0) return;

    const columnName = property.yProperty.fromColumn;
    const columnIndex = columns.findIndex(c => c.name === columnName);
    if (columnIndex === -1) return;

    const firstValue = rows[0][columnIndex];
    if (typeof firstValue !== 'number') return;

    xKeys.forEach((key: number, i: number) => {
      const value = rows[i][columnIndex];
      if (value === null) return;
      const dataItem = this.data.get(key);
      dataItem[property.id] = value;
      property.empty = false;
    });
  }
}

function compareDataItems(a: {key: number}, b: {key: number}): number {
  return a.key - b.key;
}
