import type { ReactElement } from 'react';
import type { ChartAxis } from '../../lib/chart.types';
import { YAxis } from 'recharts';
import { measureText } from 'shared/drawing';
import { calcAxisDomain, tickFormatter } from '../../lib/axis-utils';


interface YAxisLabel {
  value: string;
  angle: number;
  offset: number;
  position: 'insideLeft' | 'insideRight';
}

export function toYAxis(axis: ChartAxis): ReactElement {
  const { domain, ticks } = calcAxisDomain(axis);
  let label: YAxisLabel;
  let width = Math.max(...ticks.map(n => measureText(tickFormatter(n), '11px Roboto'))) + 7;

  if (axis.displayName) {
    if (axis.location === 'left') {
      label = {value: axis.displayName, angle: -90, offset: 10, position: 'insideLeft'};
    } else {
      label = {value: axis.displayName, angle: 90, offset: 10, position: 'insideRight'};
    }
    width += 16;
  }

  return (
    <YAxis
      key={axis.id} yAxisId={axis.id}
      scale={axis.scale} orientation={axis.location} reversed={axis.inverse}
      domain={domain} ticks={ticks} minTickGap={0} tickFormatter={tickFormatter}
      label={label} stroke={axis.color} width={width} allowDataOverflow={true}
    />
  );
}
