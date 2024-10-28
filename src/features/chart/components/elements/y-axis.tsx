import type { ChartAxis } from '../../lib/chart.types';
import { YAxis } from 'recharts';
import { getFormattedMinMax, tickFormatter } from '../../lib/utils';


interface YAxisLabel {
  value: string;
  angle: number;
  offset: number;
  position: 'insideLeft' | 'insideRight';
}

export function toYAxis(axis: ChartAxis) {
  const tickCount = axis.tickCount ? axis.tickCount + 1 : 11;
  const domain = (axis.max !== null && axis.min !== null) ? [axis.min, axis.max] : getFormattedMinMax;

  let label: YAxisLabel;
  if (axis.location === 'left') {
    label = {value: axis.displayName, angle: -90, offset: 10, position: 'insideLeft'};
  } else {
    label = {value: axis.displayName, angle: 90, offset: 10, position: 'insideRight'};
  }

  return (
    <YAxis
      key={axis.id} yAxisId={axis.id} domain={domain} width={50} scale={axis.scale}
      tickCount={tickCount} minTickGap={0} tickFormatter={tickFormatter}
      orientation={axis.location} label={label} stroke={axis.color} reversed={axis.inverse}
    />
  );
};
