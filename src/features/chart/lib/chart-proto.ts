import { Payload } from 'recharts/types/component/DefaultLegendContent';
import { YAxisProps, getYAxisProto, toMonYear, toYear, monthStep, yearStep } from '../components/axes';
import { ChartDiagram, getDiagramProto, getDiagramLegend } from '../components/diagrams';
import { ChartMarkProps, getChartMarkProto, getChartMarkLegend } from '../components/vertical-marks';


export interface ChartProto {
  data: Record<string, number | string>[],
  axes: YAxisProps[],
  diagrams: ChartDiagram[],
  marks: ChartMarkProps[],
  legend: Payload[],
}


/** Строит прототип графика, который далее будет рендерится библиотекой _Recharts_. */
export const getChartProto = (
  channelsData: Channel[],
  seriesSettings: ChartSeriesSettings, dateStep: ChartDateStep
): ChartProto => {
  const data: Record<number, Record<string, number | string>> = {};
  const diagrams: ChartDiagram[] = [];
  const axes: YAxisProps[] = [];
  const marks: ChartMarkProps[] = [];
  const legend: Payload[] = [];

  const dateFn = dateStep === 'month' ? toMonYear : toYear;
  const stepFn = dateStep === 'month' ? monthStep : yearStep;

  for (const channel of channelsData) {
    const rows = channel?.data?.rows;
    if (!rows?.length) continue;
    const settings = seriesSettings[channel.name];
    if (settings.xAxisType !== 'Dates') continue;

    const columns = channel.data.columns;
    const properties = channel.info.properties;
    const axesSettings = settings.axesSettings;

    for (const yAxisID in axesSettings) {
      if (axes.some(axis => axis.key === yAxisID)) continue;
      axes.push(getYAxisProto(yAxisID, axesSettings[yAxisID]));
    }

    const xIndex = columns.findIndex(column => column.NetType.endsWith('DateTime'));
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
            sameMark.label.value.push({id, property});
          } else {
            marks.push(getChartMarkProto(xValue.x, key, property, item, id));
          }
        });
        legend.push(getChartMarkLegend(dataKey, name, item.color));
      } else {
        diagrams.push(getDiagramProto(dataKey, name, item));
        legend.push(getDiagramLegend(dataKey, name, item));
      }

      xValues.forEach((xValue, i) => {
        data[xValue.step][dataKey] = rows[i].Cells[dataIndex];
      });
    }
  }
  const sortedData = Object.values(data).sort(sortDataFn);
  return {data: sortedData, diagrams: diagrams.sort(sortDiagramsFn), axes, marks, legend};
}

const sortDataFn = (a: {step: number}, b: {step: number}) => a.step - b.step;
const sortDiagramsFn = (a: ChartDiagram, b: ChartDiagram) => a.zIndex - b.zIndex;
