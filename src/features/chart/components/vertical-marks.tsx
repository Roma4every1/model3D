import { FunctionComponent, useState } from 'react';
import { Payload } from 'recharts/types/component/DefaultLegendContent';
import { measureText } from 'shared/lib';


/** Вертикальная пометка на графике.
 * + `key` — id метки
 * + `x` — значение по оси X
 * + `label` — подпись (`<rect/>` и `<text/>`)
 * + `stroke` — цвет пунктирной линии
 * */
export interface ChartMarkProps {
  key: string,
  x: string,
  yAxisId?: string,
  label: {content: FunctionComponent, value: ChartMarkLabelItem[]},
  stroke: string,
}
interface ChartMarkLabelItem {
  id: string,
  text?: string,
  property: ChannelProperty,
}

interface ChartMarkViewProps {
  value: ChartMarkLabelItem[],
  viewBox: {x: number, y: number, width: number, height: number},
}
interface MarkTextBoxProps {
  x: number,
  y: number,
  text: string,
  onClick: () => void,
}


export const getChartMarkProto = (
  x: string, key: string, property: ChannelProperty,
  item: SeriesSettingsItem, id: string,
): ChartMarkProps => {
  const value = [{id, property}];
  return {x, key, label: {content: ChartMarkView, value}, stroke: item.color};
};

export const getChartMarkLegend = (id: string, name: string, color: string): Payload => {
  return {id, type: 'plainline', value: name, payload: {strokeDasharray: '6 6'}, color};
};

const ChartMarkView = ({value, viewBox: { x, height }}: ChartMarkViewProps) => {
  const [expandArray, setExpandArray] = useState<boolean[]>(new Array(value.length).fill(false));

  const y = height / 2;
  const boxes: JSX.Element[] = [];

  for (let i = 0; i < value.length; i++) {
    const item = value[i], isExpanded = expandArray[i];
    const text = isExpanded && item.text ? item.text : item.property.displayName;

    const onClick = () => {
      setExpandArray(expandArray.map((expanded, idx) => idx === i ? !expanded : expanded));
    };
    boxes.push(<MarkTextBox key={i} x={x} y={y + i * 50} text={text} onClick={onClick}/>);
    if (isExpanded) break;
  }

  return <>{boxes}</>;
};

const MarkTextBox = ({x, y, text, onClick}: MarkTextBoxProps) => {
  const labelWidth = measureText(text) + 8;
  return (
    <g>
      <rect x={x - 8} y={y - labelWidth / 2} width={16} height={labelWidth}/>
      <text x={x + 4} y={y} transform={`rotate(-90 ${x + 4} ${y})`} onClick={onClick}>
        {text}
      </text>
    </g>
  );
};
