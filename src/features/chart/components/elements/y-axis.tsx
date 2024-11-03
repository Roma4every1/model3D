import type { ReactElement } from 'react';
import type { ChartAxis } from '../../lib/chart.types';
import { YAxis } from 'recharts';
import { getAxisDomain, tickFormatter } from '../../lib/axis-utils';


interface YAxisLabel {
  value: string;
  angle: number;
  offset: number;
  position: 'insideLeft' | 'insideRight';
}

export function toYAxis(axis: ChartAxis): ReactElement {
  const domain = getAxisDomain(axis);
  const tickCount = axis.tickCount ?? undefined;

  let label: YAxisLabel;
  if (axis.location === 'left') {
    label = {value: axis.displayName, angle: -90, offset: 10, position: 'insideLeft'};
  } else {
    label = {value: axis.displayName, angle: 90, offset: 10, position: 'insideRight'};
  }

  return (
    <YAxis
      key={axis.id} yAxisId={axis.id}
      scale={axis.scale} orientation={axis.location} reversed={axis.inverse}
      domain={domain} allowDataOverflow={true}
      tickCount={tickCount} minTickGap={0} tickFormatter={tickFormatter}
      label={label} stroke={axis.color} width={50}
    />
  );
}
