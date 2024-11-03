import type { ReactElement } from 'react';
import type { ChartProperty, ChartLegendItem } from '../../lib/chart.types';
import { createDotRenderer } from './dots';


export function createPropertyLegend(property: ChartProperty): ChartLegendItem {
  const { id, displayName: value } = property;
  const customIcon = customLegendIcon(property);
  if (customIcon) return {id, legendIcon: customIcon, value};

  const type = property.displayType;
  const item: ChartLegendItem = {id, type: 'line', value, color: property.color};

  if ((type === 'line' || type === 'area') && !property.showPoints) {
    item.type = 'plainline';
    item.payload = {strokeDasharray: property.lineDash ? '6 6' : undefined};
  }
  else if (type === 'bar') {
    item.type = 'rect';
  }
  return item;
}

function customLegendIcon(property: ChartProperty): ReactElement<SVGElement> | undefined {
  const type = property.displayType;
  const color = property.color;

  if (type === 'vertical') {
    return (
      <line
        x1={16} y1={0} x2={16} y2={32} stroke={color}
        strokeWidth={4} strokeDasharray={property.lineDash ? '6 6' : undefined}
      />
    );
  }
  if (type === 'bar') {
    return (
      <g fill={color} fillOpacity={0.5} stroke={color} strokeWidth={2.5}>
        <rect x={4} y={10} width={10} height={16}/>
        <rect x={18} y={2} width={10} height={24}/>
      </g>
    );
  }
  if (type === 'point') {
    const renderer = createDotRenderer({...property.dotOptions, size: 16});
    return renderer({cx: 16, cy: 16, fill: property.color});
  }
  return undefined;
}
