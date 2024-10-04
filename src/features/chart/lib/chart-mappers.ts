import type { ReactNode } from 'react';
import type { ChartMarkProps } from '../components/vertical-marks';
import type { YAxisProps } from '../components/axes';
import type { ChartDiagram } from '../components/diagrams';
import { createElement } from 'react';
import { ReferenceLine, YAxis } from 'recharts';


export function propsToYAxis(props: YAxisProps): ReactNode {
  return createElement(YAxis, props);
}

export function propsToDiagram(item: ChartDiagram): ReactNode {
  return createElement(item.component as any, item.props, item.child);
}

export function markToReferenceLine(props: ChartMarkProps): ReactNode {
  return createElement(ReferenceLine as any, props);
}
