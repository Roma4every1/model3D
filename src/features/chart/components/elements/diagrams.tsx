import type { ReactElement } from 'react';
import type { ChartMark, ChartProperty } from '../../lib/chart.types';
import { Area, Bar, Line, Scatter, LabelList, ReferenceLine } from 'recharts';
import { CustomVerticalMark } from './vertical-mark';


export function toDiagram(property: ChartProperty): ReactElement {
  const displayType = property.displayType;
  if (displayType === 'vertical') return null;

  const { id, displayName, yAxisID, curveType, color, showPoints } = property;
  const labels = property.showLabels && <LabelList dataKey={id} position={'top'} fill={'black'}/>;

  if (displayType === 'line') {
    return (
      <Line
        key={id} yAxisId={yAxisID} dataKey={id} name={displayName} type={curveType}
        stroke={color} strokeWidth={2} dot={showPoints ? {stroke: 'none', fill: color} : false}
        connectNulls={true} isAnimationActive={false}
      >
        {labels}
      </Line>
    );
  }
  if (displayType === 'area') {
    return (
      <Area
        key={id} yAxisId={yAxisID} dataKey={id} name={displayName} type={curveType}
        dot={showPoints ? {stroke: 'none', fill: color, fillOpacity: 1} : false}
        fill={color} fillOpacity={0.25} stroke={property.showLine ? color : 'none'} strokeWidth={2}
        connectNulls={true} isAnimationActive={false}
      >
        {labels}
      </Area>
    );
  }
  if (displayType === 'bar') {
    return (
      <Bar
        key={id} yAxisId={yAxisID} dataKey={id} name={displayName}
        fill={color} fillOpacity={0.5} stroke={color} strokeWidth={0.5} isAnimationActive={false}
      >
        {labels}
      </Bar>
    );
  }
  return (
    <Scatter
      key={id} yAxisId={yAxisID} dataKey={id} name={displayName}
      fill={color} shape={property.dotRenderer} isAnimationActive={false}
    >
      {labels}
    </Scatter>
  );
}

export function toReferenceLine(mark: ChartMark): ReactElement {
  const visibleLabels = mark.values.filter(l => l.property.visible);
  if (visibleLabels.length === 0) return null;

  const { yAxisID, lineDash } = visibleLabels[0].property;
  const labels = visibleLabels.filter(l => l.property.showLabels);

  let labelContent: any = false;
  if (labels.length) labelContent = {content: CustomVerticalMark, value: labels};

  return (
    <ReferenceLine
      key={mark.x} x={mark.x} yAxisId={yAxisID}
      stroke={'black'} strokeDasharray={lineDash} label={labelContent}
    />
  );
}
