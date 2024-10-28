import type { ReactElement } from 'react';
import type { ChartMark, ChartProperty } from '../../lib/chart.types';
import { Area, Bar, Line, Scatter, LabelList, ReferenceLine } from 'recharts';
import { CustomVerticalMark } from './vertical-mark';


export function toDiagram(property: ChartProperty): ReactElement {
  const displayType = property.displayType;
  if (displayType === 'vertical') return null;

  const { id, yAxisID, curveType, color, showPoint, showLabels } = property;
  const labels = showLabels && <LabelList dataKey={id} position={'top'} fill={'black'}/>;

  if (displayType === 'line') {
    return (
      <Line
        key={id} yAxisId={yAxisID} dataKey={id} type={curveType} name={'1'}
        stroke={color} strokeWidth={2} dot={showPoint ? {stroke: 'none', fill: color} : false}
        connectNulls={true} isAnimationActive={false}
      >
        {labels}
      </Line>
    );
  }
  if (displayType === 'area') {
    return (
      <Area
        key={id} yAxisId={yAxisID} dataKey={id} type={curveType} fill={color}
        stroke={color} strokeWidth={2} dot={showPoint ? {stroke: 'none', fill: color} : false}
        connectNulls={true} isAnimationActive={false}
      >
        {labels}
      </Area>
    );
  }
  if (displayType === 'bar') {
    return (
      <Bar
        key={id} yAxisId={yAxisID} dataKey={id} fill={color}
        stroke={color} strokeWidth={2} isAnimationActive={false}
      >
        {labels}
      </Bar>
    );
  }
  return (
    <Scatter key={id} yAxisId={yAxisID} fill={color} dataKey={id} isAnimationActive={false}/>
  );
}

export function toReferenceLine(mark: ChartMark): ReactElement {
  const label = {content: CustomVerticalMark, value: mark};
  return <ReferenceLine key={mark.x} x={mark.x} label={label as any}/>;
}
