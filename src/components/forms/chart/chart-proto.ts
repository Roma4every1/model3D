import { Payload } from "recharts/types/component/DefaultLegendContent";
import { YAxisProps, getYAxisProto, toMonYear, toYear, monthStep, yearStep } from "./chart-axes";
import { ChartDiagram, getDiagramProto, getDiagramLegend } from "./chart-diagrams";
import { ChartMarkProps, getChartMarkProto, getChartMarkLegend, getChartMarkLabel } from "./chart-marks";


export interface ChartProto {
  data: Record<string, number | string>[],
  axes: YAxisProps[],
  diagrams: ChartDiagram[],
  marks: ChartMarkProps[],
  legend: Payload[],
}


/** Строит прототип графика, который далее будет рендерится библиотекой _Recharts_. */
export const getChartProto = (channels: Channel[], seriesSettings: ChartSeriesSettings, dateStep: ChartDateStep): ChartProto => {
  const data: Record<number, Record<string, number | string>> = {};
  const diagrams: ChartDiagram[] = [];
  const axes: YAxisProps[] = [];
  const marks: ChartMarkProps[] = [];
  const legend: Payload[] = [];

  const dateFn = dateStep === 'month' ? toMonYear : toYear;
  const stepFn = dateStep === 'month' ? monthStep : yearStep;

  for (const channel of channels) {
    const rows = channel.data?.Rows;
    const settings = seriesSettings[channel.id];
    if (!rows?.length || settings.xAxisType !== 'Dates') continue;

    const columns = channel.data.Columns;
    const properties = channel.properties;
    const axesSettings = settings.axesSettings;

    for (const yAxisID in axesSettings) {
      if (axes.some(axis => axis.key === yAxisID)) continue;
      axes.push(getYAxisProto(yAxisID, axesSettings[yAxisID]));
    }

    const xIndex = columns.findIndex(column => column.NetType === 'System.DateTime');
    const xID = columns[xIndex].Name;

    const xValues = rows.map((x, i) => {
      const date = new Date(rows[i].Cells[xIndex]);
      return {x: dateFn(date), step: stepFn(date)};
    });
    for (const xValue of xValues) if (!data[xValue.step]) data[xValue.step] = xValue;

    for (const property of properties) {
      if (property.fromColumn === xID) continue;

      const dataIndex = columns.findIndex(column => column.Name === property.fromColumn);
      if (dataIndex === -1) continue;

      const dataKey = columns[dataIndex].Name;
      const settingsItem = settings.seriesSettings;
      const item = settingsItem[dataKey];
      const name = property.displayName;
      if (!item) continue;

      if (item.typeCode === 'vertical') {
        xValues.forEach((xValue, i) => {
          const id = rows[i].Cells[dataIndex], key = dataKey + i;
          const sameMark = marks.find(mark => mark.x === xValue.x);
          if (sameMark) {
            sameMark.label.value.push(getChartMarkLabel(property, id));
          } else {
            marks.push(getChartMarkProto(xValue.x, key, property, item, id));
          }
        });
        legend.push(getChartMarkLegend(dataKey, name, item.color));
      } else {
        diagrams.push(getDiagramProto(dataKey, name, item));
        legend.push(getDiagramLegend(dataKey, name, item));
      }

      if (columns[dataIndex].NetType === 'System.Decimal') {
        xValues.forEach((xValue, i) => {
          data[xValue.step][dataKey] = parseFloat(rows[i].Cells[dataIndex].replace(',', '.'));
        });
      } else {
        xValues.forEach((xValue, i) => {
          data[xValue.step][dataKey] = rows[i].Cells[dataIndex];
        });
      }
    }
  }
  const sortedData = Object.values(data).sort(sortDataFn);
  return {data: sortedData, diagrams: diagrams.sort(sortDiagramsFn), axes, marks, legend};
}

const sortDataFn = (a: {step: number}, b: {step: number}) => a.step - b.step;
const sortDiagramsFn = (a: ChartDiagram, b: ChartDiagram) => a.zIndex - b.zIndex;
