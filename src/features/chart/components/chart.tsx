import type { ChartLegendItem } from '../lib/chart.types';
import { useEffect } from 'react';
import { useCurrentPng } from 'recharts-to-png';
import { useChannelDict } from 'entities/channel';
import { useChartState } from '../store/chart.store';
import { updateChartState, setChartChannelData, setChartLookupData } from '../store/chart.actions';

import './chart.scss';
import { ResponsiveContainer, ComposedChart, CartesianGrid, Legend, Tooltip, XAxis } from 'recharts';
import { TextInfo } from 'shared/ui';
import { toYAxis } from './elements/y-axis';
import { toDiagram, toReferenceLine } from './elements/diagrams';


export const Chart = ({id}: SessionClient) => {
  const state = useChartState(id);
  const [getPng, { ref }] = useCurrentPng();

  const stage = state.stage;
  const channelData = useChannelDict(state.usedChannels);
  const lookupData = useChannelDict(state.usedLookups);

  useEffect(() => {
    state.getPng = getPng;
  }, [getPng]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setChartChannelData(id, channelData);
  }, [channelData, id]);

  useEffect(() => {
    setChartLookupData(id, lookupData);
  }, [lookupData, id]);

  if (stage.properties.length === 0) {
    return <TextInfo text={'chart.empty'}/>;
  }

  const data = stage.getData();
  const legend = stage.getLegend();

  const setActiveProperty = (item: ChartLegendItem) => {
    if (stage.getActiveProperty()?.id === item.id) return;
    stage.setActiveProperty(item.id);
    updateChartState(id);
  };

  return (
    <ResponsiveContainer width={'100%'} height={'100%'}>
      <ComposedChart
        ref={ref} data={data.records} barGap={1}
        margin={{top: 2, left: 0, bottom: 0, right: 0}} style={{overflow: 'hidden'}}
      >
        <Legend verticalAlign={'top'} payload={legend} onClick={setActiveProperty}/>
        <CartesianGrid strokeDasharray={'4 4'}/>
        <XAxis dataKey={'x'} type={stage.xAxisType === 'number' ? 'number' : 'category'}/>
        {stage.axes.map(toYAxis)}
        {stage.getDisplayedProperties().map(toDiagram)}
        {data.marks.map(toReferenceLine)}
        {state.global.showTooltip && <Tooltip/>}
      </ComposedChart>
    </ResponsiveContainer>
  );
};
