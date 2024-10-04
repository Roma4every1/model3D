import { useEffect, useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, CartesianGrid, Legend, Tooltip, XAxis } from 'recharts';
import { useCurrentPng } from 'recharts-to-png';
import { saveAs } from '@progress/kendo-file-saver';
import { TextInfo } from 'shared/ui';
import { useChannels, useChannelDict } from 'entities/channel';

import './chart.scss';
import { getChartProto } from '../lib/chart-proto';
import { getChartLookups, applyLookupToMarks } from '../lib/lookup';
import { propsToYAxis, propsToDiagram, markToReferenceLine } from '../lib/chart-mappers';
import { useChartState } from '../store/chart.store';


const chartStyle = {overflow: 'hidden'}; // for correct tooltip display
const chartMargin = {top: 2, left: 0, bottom: 0, right: 0};

export const Chart = ({id, channels}: SessionClient) => {
  const state: ChartState = useChartState(id);
  const { seriesSettings, dateStep, tooltip } = state;
  const channelData = useChannels(channels.map(c => c.id));

  const { data, diagrams, axes, marks, legend } = useMemo(() => {
    return getChartProto(channelData, seriesSettings, dateStep);
  }, [channelData, seriesSettings, dateStep]);

  const markChannels = useMemo(() => {
    return getChartLookups(marks);
  }, [marks]);

  const [getPng, { ref }] = useCurrentPng();
  const lookupData = useChannelDict(markChannels);

  // обновление функции для сохранения графика в PNG
  useEffect(() => {
    state.downloadChart = async () => {
      const png = await getPng();
      if (png) saveAs(png, 'chart.png');
    };
  }, [getPng]); // eslint-disable-line react-hooks/exhaustive-deps

  // задание текста для вертикальных пометок
  useEffect(() => {
    if (marks.length) applyLookupToMarks(marks, lookupData);
  }, [marks, lookupData]);

  if (diagrams.length === 0) {
    return <TextInfo text={'chart.empty'}/>;
  }

  return (
    <ResponsiveContainer width={'100%'} height={'100%'}>
      <ComposedChart ref={ref} data={data} margin={chartMargin} style={chartStyle} barGap={1}>
        {tooltip && <Tooltip/>}
        <Legend verticalAlign={'top'} payload={legend}/>
        <CartesianGrid strokeDasharray={'4 4'}/>
        <XAxis dataKey={'x'}/>
        {axes.map(propsToYAxis)}
        {diagrams.map(propsToDiagram)}
        {marks.map(markToReferenceLine)}
      </ComposedChart>
    </ResponsiveContainer>
  );
};
