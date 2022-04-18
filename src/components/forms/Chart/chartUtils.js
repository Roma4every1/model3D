import {toDate} from "../../../utils";

const ruMonth = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

/**
 * Convert the date format required for the chart.
 * @example
 * "/Date(1391202000000+0300)/" => "янв 2014"
 * */
export const toMonYear = (date) => {
  date = toDate(date);
  return ruMonth[date.getMonth()] + ' ' + date.getFullYear();
}

/**
 * Convert the date format required for the chart.
 * @example
 * "/Date(1391202000000+0300)/" => "2014"
 * */
export const toYear = (date) => {
  return toDate(date).getFullYear();
}

/**
 * Convert from 'seriesSettings.json' format to style.
 * @example
 * {"A": "255", "R": "70", "G": "70", "B": "70"} => "rgba(70,70,70,255)"
 * */
export const toColor = (colorParams) => {
  return `rgba(${colorParams.R},${colorParams.G},${colorParams.B},${colorParams.A})`;
}

/**
 * Map data from 'seriesSettings.json' to convenient format for drawing a chart component.
 * */
const getChartComponentPrototype = (data, displayName) => {
  let dot = false, color = toColor(data['GeneralColor']);
  if (data['@ShowPoint'] === 'true') dot = {stroke: 'none', fill: color};
  return {
    dataKey: data['@ChannelPropertyName'],
    yAxisID: data['@AxisId'],
    name: displayName,
    type: data['@TypeCode'],
    color: color,
    labels: data['@ShowLabels'],
    dot: dot,
  };
}

/**
 * Map data from 'seriesSettings.json' to convenient format for drawing a XAxis component.
 * */
const getAxisPrototype = (axisData) => {
  let dataMin = 'dataMin', dataMax = 'dataMax';
  if (typeof axisData['Minimum'] === 'string') dataMin = parseInt(axisData['Minimum']);
  if (typeof axisData['Maximum'] === 'string') dataMax = parseInt(axisData['Maximum']);

  const isLeft = axisData['@Location'] === 'Left';

  return {
    id: axisData['@Id'],
    domain: [dataMin, dataMax],
    reversed: axisData['@Inverse'] === 'true',
    stroke: toColor(axisData['Color']),
    value: axisData['@DisplayName'],
    angle: isLeft ? -90 : 90,
    position: isLeft ? 'insideLeft' : 'insideRight',
    orientation: isLeft ? 'left' : 'right',
  };
}

/**
 * Receives raw data from app state and converts it into a format convenient for plot chart.
 * @param seriesSettings - state.formSetting.seriesSettings
 * @param properties - state.channelsData.testdata.properties
 * @param columns - state.channelsData.testdata.data.Columns
 * @param rows - state.channelsData.testdata.data.Rows
 * */
export const getChartPrototype = (seriesSettings, properties, columns, rows) => {
  if (!(seriesSettings && properties && columns && rows)) return [null, null, null, null];

  let xAxisID, xAxisAlias;
  const xProperty = properties.find((property) => property.name = seriesSettings['@XAxisFieldName']);
  if (xProperty) {
    xAxisID = xProperty.name;
    xAxisAlias = xProperty.fromColumn;
  } else {
    xAxisID = columns.find(column => column.NetType === 'System.DateTime').Name;
    xAxisAlias = xAxisID;
  }

  const axesData = seriesSettings.AxisSettings.AxisSettings.map(getAxisPrototype);
  const settings = seriesSettings.SeriesSettings.SeriesSettings;
  const valuesCount = rows.length;

  const chartData = [];
  const diagramsData = [];

  for (let i = 0; i < valuesCount; i++) chartData.push({});

  for (let item of settings) {
    const id = item['@ChannelPropertyName'];

    if (id === xAxisID) {
      const dataIndex = columns.findIndex((column) => column.Name === xAxisAlias);
      const mapFunction = seriesSettings['DateStep'] === 'Month' ? toMonYear : toYear;

      for (let j = 0; j < valuesCount; j++) {
        chartData[j][id] = mapFunction(rows[j][dataIndex]);
      }
    } else {
      const dataIndex = columns.findIndex((column) => column.Name === id);
      const property = properties.find((prop) => prop.name === id);

      diagramsData.push(getChartComponentPrototype(item, property ? property.displayName : id));

      for (let j = 0; j < valuesCount; j++) {
        chartData[j][id] = parseFloat(rows[j][dataIndex]);
      }
    }
  }

  return [diagramsData, chartData, axesData, xAxisID];
}
