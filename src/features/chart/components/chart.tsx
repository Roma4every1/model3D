import { useEffect, useMemo, useCallback } from 'react';
import { ResponsiveContainer, ComposedChart, CartesianGrid, Legend, Tooltip, XAxis } from 'recharts';
import { useCurrentPng } from 'recharts-to-png';
import { saveAs } from '@progress/kendo-file-saver';
import { TextInfo } from 'shared/ui';
import { useChannels, useChannelDict } from 'entities/channel';

import './chart.scss';
import { ChartProto, getChartProto } from '../lib/chart-proto';
import { getChartLookups, applyLookupToMarks } from '../lib/lookup';
import { propsToYAxis, propsToDiagram, markToReferenceLine } from '../lib/chart-mappers';
import { useChartState } from '../store/chart.store';
import { setChartDownloadFn } from '../store/chart.actions';


const chartStyle = {overflow: 'hidden'}; // for correct tooltip display
const chartMargin = {top: 2, left: 0, bottom: 0, right: 0};

export const Chart = ({id, channels}: SessionClient) => {
  const [getPng, { ref }] = useCurrentPng();

  const channelsData = useChannels(channels.map(c => c.name));
  const state: ChartState = useChartState(id);
  const { seriesSettings, dateStep, tooltip } = state;

  const { data, diagrams, axes, marks, legend } = useMemo<ChartProto>(() => {
    return getChartProto(channelsData, seriesSettings, dateStep);
  }, [channelsData, seriesSettings, dateStep]);

  const markChannels = useMemo(() => {
    return getChartLookups(marks);
  }, [marks]);

  const lookupData = useChannelDict(markChannels);

  const handleDownload = useCallback(async () => {
    const png = await getPng();
    if (png) saveAs(png, 'chart.png');
  }, [getPng]);

  // обновление функции для сохранения графика в PNG
  useEffect(() => {
    setChartDownloadFn(id, handleDownload);
  }, [id, handleDownload]);

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
