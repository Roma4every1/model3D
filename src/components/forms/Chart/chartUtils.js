import {getYAxisDomain, toColor, toMonYear, toYear} from "./chartAxisUtils";


/** Строит объект, по которому отрендерится ось из _Recharts_. */
export const getAxisPrototype = (axis) => {
  const isLeft = axis['@Location'] === 'Left';
  const [domain, tickCount] = getYAxisDomain(axis['Minimum'], axis['Maximum'], axis['TicksCount']);

  return {
    id: axis['@Id'],
    reversed: axis['@Inverse'] === 'true',
    stroke: toColor(axis['Color']),
    value: axis['@DisplayName'],
    angle: isLeft ? -90 : 90,
    position: isLeft ? 'insideLeft' : 'insideRight',
    orientation: isLeft ? 'left' : 'right',
    domain, tickCount,
  };
}

/** Строит объект, по которому отрендерится линия/область/гистограмма из _Recharts_. */
const getChartItemPrototype = (dataKey, settings, displayName) => {
  let dot = false, color;

  if (settings.hasOwnProperty('GeneralColor')) color = toColor(settings['GeneralColor']);
  if (settings['@ShowPoint'] === 'true') dot = {stroke: 'none', fill: color};

  return {
    dataKey, dot,
    yAxisId: settings['@AxisId'],
    name: displayName,
    type: settings['@TypeCode'],
    stroke: color,
    labels: settings['@ShowLabels'] === 'true',
  };
}

/**
 * Строит прототип графика, который далее будет рендерится _Recharts_.
 * @param seriesSettings - `state.formSetting.seriesSettings`
 * @param properties - `state.channelsData[channel].properties`
 * @param columns - `state.channelsData[channel].data.Columns`
 * @param rows - `state.channelsData[channel].data.Rows`
 * */
export const getChartPrototype = (seriesSettings, properties, columns, rows) => {
  if (!(seriesSettings && properties && columns && rows)) return [null, null, null, null];

  const axesData = seriesSettings['AxisSettings']['AxisSettings'].map(getAxisPrototype);
  const settings = seriesSettings['SeriesSettings']['SeriesSettings'];

  const chartData = Array.from({length: rows.length}, () => {return {}});
  const diagramsData = [];

  const xIndex = columns.findIndex(column => column['NetType'] === 'System.DateTime');
  const xID = columns[xIndex].Name;

  for (let j = 0; j < rows.length; j++)
    chartData[j][xID] = (seriesSettings['DateStep'] === 'Month' ? toMonYear : toYear)(rows[j][xIndex]);

  for (let property of properties) {
    if (property.fromColumn === xID) continue;

    const dataIndex = columns.findIndex((column) => column.Name === property.fromColumn);
    if (dataIndex === -1) continue;

    const dataKey = columns[dataIndex].Name;
    const columnSeriesSettings = settings.find((item) => item['@ChannelPropertyName'] === dataKey) || {};

    diagramsData.push(getChartItemPrototype(dataKey, columnSeriesSettings, property.displayName));

    if (columns[dataIndex]['NetType'] === 'System.Decimal') {
      for (let j = 0; j < rows.length; j++) {
        chartData[j][dataKey] = parseFloat(rows[j][dataIndex].replace(',', '.'));
      }
    } else {
      for (let j = 0; j < rows.length; j++) {
        chartData[j][dataKey] = rows[j][dataIndex];
      }
    }
  }

  return [diagramsData, chartData, axesData, xID];
}
