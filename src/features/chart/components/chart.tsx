import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ResponsiveContainer, ComposedChart, CartesianGrid, Legend, Tooltip, XAxis } from 'recharts';
import { ChartProto, getChartProto } from '../lib/chart-proto';
import { mapAxes, mapDiagrams, mapMarks } from '../lib/chart-mappers';
import { channelsSelector } from 'entities/channels';
import { compareArrays } from 'shared/lib';
import './chart.scss';


const chartStyle = {overflow: 'hidden'};
const chartMargin = {top: 2, left: 0, bottom: 0, right: 0};

export const Chart = ({channels, settings}: FormState) => {
  const channelsData: Channel[] = useSelector(channelsSelector.bind(channels), compareArrays);
  const { seriesSettings, dateStep, tooltip } = settings as ChartFormSettings;

  const proto = useMemo<ChartProto>(() => {
    return getChartProto(channels, channelsData, seriesSettings, dateStep);
  }, [channels, channelsData, seriesSettings, dateStep]);

  if (proto.diagrams.length === 0) return <EmptyChart/>;

  return (
    <ResponsiveContainer>
      <ComposedChart data={proto.data} margin={chartMargin} style={chartStyle} barGap={1}>
        {tooltip && <Tooltip/>}
        <Legend verticalAlign={'top'} payload={proto.legend}/>
        <CartesianGrid strokeDasharray={'4 4'}/>
        <XAxis dataKey={'x'}/>
        {proto.axes.map(mapAxes)}
        {proto.diagrams.map(mapDiagrams)}
        {proto.marks.map(mapMarks)}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

const EmptyChart = () => {
  return <div className={'map-not-found'}>Данные отсутствуют</div>;
};
