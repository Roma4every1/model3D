import { ChartMarkProps } from '../components/vertical-marks';
import { YAxisProps } from '../components/axes';
import { ChartDiagram } from '../components/diagrams';
import { createElement } from 'react';
import { ReferenceLine, YAxis } from 'recharts';


export const propsToYAxis = (props: YAxisProps) => {
  return createElement(YAxis, props);
};

export const propsToDiagram = (item: ChartDiagram) => {
  return createElement(item.component as any, item.props, item.child);
};

export const markToReferenceLine = (props: ChartMarkProps) => {
  return createElement(ReferenceLine as any, props);
};
