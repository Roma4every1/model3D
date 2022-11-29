import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ResponsiveContainer, ComposedChart, CartesianGrid, Legend, Tooltip, YAxis, XAxis } from "recharts";
import { actions, selectors } from "../../store";
import { getChartPrototype, mapDiagramsData } from "./Chart/chart-utils";
import { mapAxesData } from "./Chart/chart-axis-utils";
import { ChartMark, chartMarksSelector, mapChartMarks } from "./Chart/chart-marks";
import { compareArrays } from "../../utils/utils";
import "../../styles/chart.scss";


function chartDataSelector(this: ChannelName, state: WState) {
  try {
    const { data, properties } = state.channelsData[this];
    return [data.Columns, data['Rows'].map((row) => row.Cells), properties];
  } catch {
    return [null, null, null];
  }
}

export default function Chart({data}) {
  const dispatch = useDispatch();
  const formID = data.formId;

  const chartState: ChartState = useSelector(selectors.chartState.bind(formID));
  const [columns, rows, properties] = useSelector(chartDataSelector.bind(data.activeChannels[0]), compareArrays);

  const sessionID = useSelector(selectors.sessionID);
  const sessionManager = useSelector(selectors.sessionManager);

  // добавление состояние в хранилище графиков
  useEffect(() => {
    if (!chartState) dispatch(actions.createChartState(formID));
  }, [chartState, formID, dispatch]);

  // загрузка настроек графика
  useEffect(() => {
    let ignore = false;
    if (sessionID) {
      const path = `pluginData?sessionId=${sessionID}&formId=${formID}&pluginName=chartSeriesSettings`;
      sessionManager.fetchData(path).then((data: any) => {
        if (!ignore && data) dispatch(actions.setSeriesSettings(formID, data.chartSeriesSettings));
      });
    }
    return () => { ignore = true; }
  }, [formID, sessionID, sessionManager, dispatch]);

  const [diagramsData, chartData, axesData, xAxisID, dateFn] = useMemo(() => {
    return getChartPrototype(chartState?.seriesSettings, properties, columns, rows);
  }, [properties, columns, rows, chartState?.seriesSettings]);

  const chartMarks: ChartMark[] = useSelector(chartMarksSelector.bind({
    channelName: data.activeChannels[1], dateFn,
  }));

  if (!diagramsData || !chartData || rows.length === 0) return <EmptyChart/>;

  return (
    <ResponsiveContainer>
      <ComposedChart margin={{top: 0, left: 0, bottom: 0, right: 0}} data={chartData} style={{overflow: 'hidden'}}>
        {chartState?.tooltip && <Tooltip />}
        <Legend verticalAlign={'top'} align={'center'} />
        <CartesianGrid strokeDasharray={'4 4'} />
        <XAxis dataKey={xAxisID} />

        {axesData.map(mapAxesData)}
        {diagramsData.map(mapDiagramsData)}
        {chartMarks.map(mapChartMarks)}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

const EmptyChart = () => {
  return (
    <ResponsiveContainer>
      <ComposedChart margin={{right: 10, top: 10}} data={[]}>
        <XAxis/>
        <YAxis/>
        <Legend verticalAlign={'top'} align={'center'} payload={[{value: 'Нет данных.'}]} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
