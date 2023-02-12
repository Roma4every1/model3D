import { ChartMarkProps } from '../components/vertical-marks';
import { YAxisProps } from '../components/axes';
import { ChartDiagram } from '../components/diagrams';
import { createElement } from 'react';
import { ReferenceLine, YAxis } from 'recharts';


export const mapAxes = (props: YAxisProps) => {
  return createElement(YAxis, props);
};

export const mapDiagrams = (item: ChartDiagram) => {
  return createElement(item.component as any, item.props, item.child);
};

export const mapMarks = (props: ChartMarkProps) => {
  return createElement(ReferenceLine as any, props);
};
