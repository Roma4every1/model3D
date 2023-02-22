import {useCallback, useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import { ResponsiveContainer, ComposedChart, CartesianGrid, Legend, Tooltip, XAxis } from 'recharts';
import { ChartProto, getChartProto } from '../lib/chart-proto';
import { mapAxes, mapDiagrams, mapMarks } from '../lib/chart-mappers';
import { channelsSelector } from 'entities/channels';
import { compareArrays } from 'shared/lib';
import './chart.scss';
import {useCurrentPng} from 'recharts-to-png';
import FileSaver from 'file-saver'
import {setSettingsField} from "../../../widgets/presentation";


const chartStyle = {overflow: 'hidden'};
const chartMargin = {top: 2, left: 0, bottom: 0, right: 0};

export const Chart = ({id, channels, settings}: FormState) => {

  const channelsData: Channel[] = useSelector(channelsSelector.bind(channels), compareArrays);
  const { seriesSettings, dateStep, tooltip} = settings as ChartFormSettings;

  const dispatch = useDispatch()
  const [getPng, { ref }] = useCurrentPng();
  const handleDownload = useCallback(async () => {
    const png = await getPng();
    if (png) {
      FileSaver.saveAs(png, 'chart.png');
    }
  }, [getPng]);
  useEffect(() => {
    dispatch(setSettingsField(id, 'downloadChart', handleDownload))
  }, [id])


  const proto = useMemo<ChartProto>(() => {
    return getChartProto(channels, channelsData, seriesSettings, dateStep);
  }, [channels, channelsData, seriesSettings, dateStep]);



  if (proto.diagrams.length === 0) return <EmptyChart/>;

  return (
    <>
      <ResponsiveContainer width='100%' height='99%'>
        <ComposedChart ref={ref} data={proto.data} margin={chartMargin} style={chartStyle} barGap={1}>
          {tooltip && <Tooltip/>}
          <Legend verticalAlign={'top'} payload={proto.legend}/>
          <CartesianGrid strokeDasharray={'4 4'}/>
          <XAxis dataKey={'x'}/>
          {proto.axes.map(mapAxes)}
          {proto.diagrams.map(mapDiagrams)}
          {proto.marks.map(mapMarks)}
        </ComposedChart>
      </ResponsiveContainer>
    </>
  );
};

const EmptyChart = () => {
  return <div className={'map-not-found'}>Данные отсутствуют</div>;
};
