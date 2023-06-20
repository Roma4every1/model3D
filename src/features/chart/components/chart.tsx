import { useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ResponsiveContainer, ComposedChart, CartesianGrid, Legend, Tooltip, XAxis } from 'recharts';
import { TextInfo } from 'shared/ui';
import { useCurrentPng } from 'recharts-to-png';
import { saveAs } from '@progress/kendo-file-saver';
import { compareObjects, compareArrays } from 'shared/lib';
import { channelsSelector, channelDictSelector } from 'entities/channels';
import { setSettingsField } from 'widgets/presentation';
import { ChartProto, getChartProto } from '../lib/chart-proto';
import { getChartLookups, applyLookupToMarks } from '../lib/lookup';
import { propsToYAxis, propsToDiagram, markToReferenceLine } from '../lib/chart-mappers';
import './chart.scss';


const chartStyle = {overflow: 'hidden'}; // for correct tooltip display
const chartMargin = {top: 2, left: 0, bottom: 0, right: 0};

export const Chart = ({id, channels, settings}: FormState) => {
  const dispatch = useDispatch();
  const [getPng, { ref }] = useCurrentPng();

  const channelsData: Channel[] = useSelector(channelsSelector.bind(channels), compareArrays);
  const { seriesSettings, dateStep, tooltip} = settings as ChartFormSettings;

  const { data, diagrams, axes, marks, legend } = useMemo<ChartProto>(() => {
    return getChartProto(channelsData, seriesSettings, dateStep);
  }, [channelsData, seriesSettings, dateStep]);

  const markChannels = useMemo(() => {
    return getChartLookups(marks);
  }, [marks]);

  const lookupData: ChannelDict = useSelector(channelDictSelector.bind(markChannels), compareObjects);

  const handleDownload = useCallback(async () => {
    const png = await getPng();
    if (png) saveAs(png, 'chart.png');
  }, [getPng]);

  useEffect(() => {
    dispatch(setSettingsField(id, 'downloadChart', handleDownload))
  }, [id, handleDownload, dispatch]);

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
