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
  id: FormID,
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
  let xType: string | null = null;

  for (const channel of channelsData) {
    const rows = channel?.data?.rows;
    if (!rows?.length) continue;
    const settings = seriesSettings[channel.name];

    const columns = channel.data.columns;
    const properties = channel.config.properties;
    const axesSettings = settings.axesSettings;

    for (const yAxisID in axesSettings) {
      if (axes.some((axis) => axis.key === yAxisID)) continue;
      axes.push(getYAxisProto(yAxisID, axesSettings[yAxisID]));
    }

    const xIndex = columns.findIndex(
      (column) => column.type.endsWith("DateTime") || column.type.endsWith("Double")
    );
    const xID = columns[xIndex].name;

    // Проверка соответствия типа оси X для текущего и предыдущих каналов
    if (xType === null) {
      xType = columns[xIndex].type;
    } else if (xType !== columns[xIndex].type) {
      console.warn(
        `Предупреждение: Тип оси X "${columns[xIndex].type}" не совпадает с "${xType}" в канале "${channel.name}". Канал пропущен.`
      );
      continue;
    }

    const xValues = rows.map((x, i) => {
      const xValue = rows[i][xIndex];
      if (settings.xAxisType === "Dates") {
        const date = new Date(xValue);
        return { x: dateFn(date), step: stepFn(date) };
      } else {
        return { x: xValue, step: xValue };
      }
    });
    for (const xValue of xValues) if (!data[xValue.step]) data[xValue.step] = xValue;

    for (const property of properties) {
      if (property.fromColumn === xID) continue;

      const dataIndex = columns.findIndex((column) => column.name === property.fromColumn);
      if (dataIndex === -1) continue;

      const dataKey = columns[dataIndex].name;
      const settingsItem = settings.seriesSettings;
      const item = settingsItem[dataKey];
      const name = property.displayName;
      if (!item) continue;

      if (item.typeCode === "vertical") {
        xValues.forEach((xValue, i) => {
          const id = rows[i][dataIndex],
            key = dataKey + i;
          const sameMark = marks.find((mark) => mark.x === xValue.x);
          if (sameMark) {
            sameMark.label.value.push({ id, property, color: item.color });
          } else {
            const markProto = getChartMarkProto(xValue.x, key, property, item, id);
            if (axes.length) markProto.yAxisId = axes[0].yAxisId;
            marks.push(markProto);
          }
        });
        legend.push(getChartMarkLegend(dataKey, name, item.color));
      } else {
        diagrams.push(getDiagramProto(id, dataKey, name, item));
        legend.push(getDiagramLegend(dataKey, name, item));
      }

      xValues.forEach((xValue, i) => {
        data[xValue.step][dataKey] = rows[i][dataIndex];
      });
    }
  }
  const sortedData = Object.values(data).sort(sortDataFn);
  return { data: sortedData, diagrams: diagrams.sort(sortDiagramsFn), axes, marks, legend };
};

const sortDataFn = (a: { step: number }, b: { step: number }) => a.step - b.step;
const sortDiagramsFn = (a: ChartDiagram, b: ChartDiagram) => a.zIndex - b.zIndex;
