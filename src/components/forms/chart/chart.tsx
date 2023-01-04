import { useMemo } from "react";
import { useSelector } from "react-redux";
import { ResponsiveContainer, ComposedChart, CartesianGrid, Legend, Tooltip, XAxis } from "recharts";
import { ChartProto, getChartProto } from "./chart-proto";
import { mapAxes, mapDiagrams, mapMarks } from "./chart-mappers";
import { compareArrays } from "../../../utils/utils";
import { selectors } from "../../../store";
import "../../../styles/chart.scss";


interface ChartProps {
  data: {formId: FormID, activeChannels: ChannelName[]},
}


function chartDataSelector(this: ChannelName[], state: WState): Channel[] {
  return this.map(channel => state.channelsData[channel]);
}

const chartStyle = {overflow: 'hidden'};
const chartMargin = {top: 0, left: 0, bottom: 0, right: 0};

export default function Chart({data: {formId: formID, activeChannels}}: ChartProps) {
  const channels: Channel[] = useSelector(chartDataSelector.bind(activeChannels), compareArrays);
  const settings: ChartSettings = useSelector(selectors.formSettings.bind(formID));
  const { seriesSettings, dateStep, tooltip } = settings;

  const proto = useMemo<ChartProto>(() => {
    return getChartProto(channels, seriesSettings, dateStep);
  }, [channels, seriesSettings, dateStep]);

  if (proto.diagrams.length === 0) return <EmptyChart/>;

  return (
    <ResponsiveContainer>
      <ComposedChart data={proto.data} margin={chartMargin} style={chartStyle}>
        {tooltip && <Tooltip/>}
        <Legend verticalAlign={'top'} align={'center'} payload={proto.legend} height={24}/>
        <CartesianGrid strokeDasharray={'4 4'}/>
        <XAxis dataKey={'x'}/>
        {proto.axes.map(mapAxes)}
        {proto.diagrams.map(mapDiagrams)}
        {proto.marks.map(mapMarks)}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

const EmptyChart = () => {
  return <div className={'map-not-found'}>Данные отсутствуют</div>;
};
