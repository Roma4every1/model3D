import type { ChartProperty, ChartData, ChartDataRecord, ChartMark } from './chart.types';
import { isNumberColumn, isDateColumn } from 'shared/lib';
import { monthStep, yearStep, toMonYear, toYear } from './date-utils';


/** Специальный класс для управления данными графика. */
export class ChartDataController {
  /** Тип оси X. */
  public readonly xType: ChartXAxisType;
  /** Функция для получения ключа даты или категории. */
  private keyGetter: (date: Date) => number;
  /** Функция для форматирования даты или категории. */
  private keyFormatter: (date: Date) => string;

  /** Исходные данные. */
  private channelData: ChannelDict;
  /** Исходные данные справочников. */
  private lookupData: ChannelDict;

  private records: Map<number, ChartDataRecord>;
  private marks: Map<number, ChartMark>;

  constructor(type: ChartXAxisType) {
    this.xType = type;
  }

  public setChannelData(data: ChannelDict): void {
    this.channelData = data;
  }

  public setLookupData(data: ChannelDict): void {
    this.lookupData = data;
  }

  public setDateStep(step: ChartDateStep): void {
    if (this.xType !== 'date') return;
    this.keyGetter = step === 'month' ? monthStep : yearStep;
    this.keyFormatter = step === 'month' ? toMonYear : toYear;
  }

  /* --- --- */

  public createData(properties: ChartProperty[]): ChartData {
    this.records = new Map();
    this.marks = new Map();
    const xValueMap = new Map<ChannelProperty, number[]>();

    for (const chartProperty of properties) {
      const channelData = this.channelData[chartProperty.channel.id]?.data;
      if (!channelData || channelData.rows.length === 0) continue;

      const xProperty = chartProperty.xProperty;
      let xValues = xValueMap.get(xProperty);

      if (xValues === undefined) {
        xValues = this.getXValues(xProperty, channelData);
        xValueMap.set(xProperty, xValues);
      }
      if (xValues.length === 0) continue;
      this.setPropertyData(chartProperty, xValues, channelData);
    }
    const records = [...this.records.values()].sort(compareDataItems);
    const marks = [...this.marks.values()];

    this.records = null;
    this.marks = null;
    return {records, marks};
  }

  private getXValues(channelProperty: ChannelProperty, data: ChannelData): number[] | null {
    const columnName = channelProperty.fromColumn;
    const xIndex = data.columns.findIndex(c => c.name === columnName);

    if (this.xType === 'date') {
      return this.getDateXValues(data, xIndex)
    } else if (this.xType === 'number') {
      return this.getNumberXValues(data, xIndex);
    } else {
      throw new Error('Category X axis is not yet implemented');
    }
  }

  private getNumberXValues(data: ChannelData, columnIndex: number): number[] {
    const xValues: number[] = [];
    if (!isNumberColumn(data.columns[columnIndex])) return xValues;

    for (const row of data.rows) {
      const key = row[columnIndex];
      if (key === null) continue;

      if (!this.records.has(key)) {
        this.records.set(key, {x: key, key: key});
      }
      xValues.push(key);
    }
    return xValues;
  }

  private getDateXValues(data: ChannelData, columnIndex: number): number[] {
    const xValues: number[] = [];
    if (!isDateColumn(data.columns[columnIndex])) return xValues;

    for (const row of data.rows) {
      const cellValue = row[columnIndex];
      if (cellValue === null) continue;

      const date = new Date(cellValue);
      const key = this.keyGetter(date);

      if (!this.records.has(key)) {
        this.records.set(key, {x: this.keyFormatter(date), key: key});
      }
      xValues.push(key);
    }
    return xValues;
  }

  private setPropertyData(property: ChartProperty, xKeys: number[], data: ChannelData): void {
    property.empty = true;
    const rows = data.rows;
    if (rows.length === 0) return;

    const columnName = property.yProperty.fromColumn;
    const columnIndex = data.columns.findIndex(c => c.name === columnName);
    if (columnIndex === -1) return;

    if (property.displayType === 'vertical') {
      xKeys.forEach((key: number, i: number) => {
        const value = rows[i][columnIndex];
        if (value === null) return;

        let mark = this.marks.get(key);
        if (!mark) {
          mark = {x: this.records.get(key).x, values: []};
          this.marks.set(key, mark);
        }
        const summary = property.displayName;
        const details = this.getMarkLabelDetails(property, value);
        mark.values.push({property, value, summary, details});
        property.empty = false;
      });
    } else {
      const column = data.columns[columnIndex];
      if (!isNumberColumn(column)) return;

      xKeys.forEach((key: number, i: number) => {
        const value = rows[i][columnIndex];
        if (value === null) return;
        const dataItem = this.records.get(key);
        dataItem[property.id] = value;
        property.empty = false;
      });
    }
  }

  /* --- --- */

  public updateMarks(marks: ChartMark[]): void {
    for (const mark of marks) {
      for (const label of mark.values) {
        label.details = this.getMarkLabelDetails(label.property, label.value);
      }
    }
  }

  private getMarkLabelDetails(property: ChartProperty, value: any): string | undefined {
    const lookupID = property.yProperty.lookupChannels[0];
    if (!lookupID) return String(value);

    const channel = this.lookupData[lookupID];
    const rows = channel?.data?.rows;
    if (!rows || rows.length === 0) return;

    const idColumnIndex = channel.config.lookupColumns.id.columnIndex;
    const valueColumnIndex = channel.config.lookupColumns.value.columnIndex;
    if (idColumnIndex === -1 || valueColumnIndex === -1) return;

    const row = rows.find(row => row[idColumnIndex] === value);
    if (row) return row[valueColumnIndex];
  }
}

function compareDataItems(a: {key: number}, b: {key: number}): number {
  return a.key - b.key;
}
