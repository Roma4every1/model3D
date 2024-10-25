import { FunctionComponentElement, createElement } from 'react';
import { Area, Bar, Line, LabelList, LegendType } from 'recharts';
import { Payload } from 'recharts/types/component/DefaultLegendContent';
import { setSelectedSeries } from '../store/chart.actions';


export interface ChartDiagram {
  component: DiagramComponent,
  props: DiagramProps,
  child: FunctionComponentElement<any>,
  zIndex: number,
}
interface DiagramProps {
  key: string,
  yAxisId: string,
  dataKey: string,
  name: string,
  dot: false | {stroke: string, fill: string},
  stroke: string,
  strokeWidth: number,
  fill: string,
  isAnimationActive: boolean,
  connectNulls: boolean,
  type: 'linear' | 'monotone' | 'step',
  onClick?: () => void;
}
type DiagramComponent = typeof Bar | typeof Line | typeof Area;


/** Строит объект, по которому отрендерится линия/область/гистограмма из _Recharts_. */
export function getDiagramProto(id: FormID, dataKey: string, name: string, settings: SeriesSettingsItem): ChartDiagram {
  const color = settings.color;
  let dot = settings.showPoint ? {stroke: 'none', fill: color} : false;

  let component: DiagramComponent = Line;
  const child = settings.showLabels && createElement(LabelList, {dataKey, position: 'top', fill: 'black' });

  if (settings.typeCode === 'point') dot ={stroke: 'none', fill: color};

  const props: DiagramProps = {
    key: dataKey, yAxisId: settings.yAxisId, dataKey, name, dot,
    type: 'linear', stroke: color, strokeWidth: 2, fill: 'none',
    isAnimationActive: false, connectNulls: true,
    onClick: () => setSelectedSeries(id, dataKey),
  };

  switch (settings.typeCode) {
    case 'gist': { component = Bar; props.stroke = color; props.fill = color; break; }
    case 'gistStack': { component = Bar; props.stroke = color; props.fill = color; break; }
    case 'area': { component = Area; props.fill = color; break; }
    case 'areaSpline': { component = Area; props.type = 'monotone'; props.fill = color; break; }
    case 'areaDiscr': { component = Area; props.type = 'step'; props.fill = color; break; }
    case 'point': { props.stroke = 'none'; props.fill = 'none'; break; }
    case 'graphSpline': { props.type = 'monotone'; props.fill = 'none'; break; }
    case 'graphDiscr': { props.type = 'step'; props.fill = 'none'; break; }
    default: { /* no other types */ }
  }
  return {component, props, child, zIndex: settings.zIndex};
}

const diagramTypeDict: Record<ChartTypeCode, LegendType> = {
  'gist': 'rect',
  'gistStack': 'rect',
  'area': 'square',
  'areaSpline': 'square',
  'areaDiscr': 'square',
  'point': 'circle',
  'graph': 'line',
  'graphSpline': 'line',
  'graphDiscr': 'line',
  'vertical': 'none',
};

export function getDiagramLegend(id: string, name: string, item: SeriesSettingsItem): Payload {
  return {id, type: diagramTypeDict[item.typeCode], value: name, color: item.color};
}
