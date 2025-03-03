import type { ReactElement } from 'react';
import type { ChartProperty, ChartAxis, ChartMark } from '../../lib/chart.types';
import { Area, Bar, Line, Scatter, LabelList, ReferenceLine } from 'recharts';
import { measureText } from 'shared/drawing';
import { chartValueFormatter } from '../../lib/axis-utils';
import { CustomVerticalMark } from './vertical-mark';


interface CustomLabelProps {
  value: number;
  x: number;
  y: number;
  width: number;
}

export function toDiagram(property: ChartProperty, axes: ChartAxis[]): ReactElement {
  const displayType = property.displayType;
  if (displayType === 'vertical') return null;

  let labels: ReactElement;
  const { id, displayName, yAxisID, curveType, color, showPoints } = property;

  if (property.showLabels) {
    const axis = axes.find(a => a.id === yAxisID);
    const isBottom = (axis.inverse && axis.min > 0) || (!axis.inverse && axis.min < 0);
    const content = (props: CustomLabelProps): ReactElement => customLabel(props, color, isBottom);
    labels = <LabelList dataKey={id} content={content}/>;
  }
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

function customLabel(props: CustomLabelProps, color: ColorString, isBottom: boolean): ReactElement {
  const value = props.value;
  if (value === null || value === undefined) return null;

  const valueString = chartValueFormatter(value);
  const textWidth = measureText(valueString, '10px Roboto');
  const textHeight = 10;

  const valueY = props.y;
  const textX = props.x + (props.width ?? 0) / 2;
  const textY = isBottom ? (valueY + textHeight + textHeight / 2) : (valueY - textHeight);

  const rectX = textX - textWidth / 2 - 2;
  const rectY = textY - textHeight;

  return (
    <g>
      <line x1={textX} y1={valueY} x2={textX} y2={textY} stroke={color}/>
      <rect x={rectX} y={rectY} width={textWidth + 4} height={textHeight + 4} fill={color}/>
      <text x={textX} y={textY} fill={'#fff'}>{valueString}</text>
    </g>
  );
}
