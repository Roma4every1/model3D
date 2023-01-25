import { FunctionComponent, useState } from 'react';
import { Payload } from 'recharts/types/component/DefaultLegendContent';
import { textWidth } from '../../../layout/left-tabs';


/** Вертикальная пометка на графике.
 * + `key` — id метки
 * + `x` — значение по оси X
 * + `label` — подпись (`<rect/>` и `<text/>`)
 * + `stroke` — цвет пунктирной линии
 * */
export interface ChartMarkProps {
  key: string,
  x: string,
  label: {content: FunctionComponent, value: any},
  stroke: string,
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
  const value = getChartMarkLabel(property, id);
  return {x, key, label: {content: ChartMarkView, value: [value]}, stroke: item.color};
};

export const getChartMarkLabel = (property: ChannelProperty, id: string) => {
  const expandedText = property.lookupData.find(datum => datum.id === id)?.value;
  return {defaultText: property.displayName, expandedText};
};

const payload = {strokeDasharray: '6 6'};

export const getChartMarkLegend = (id: string, name: string, color: string): Payload => {
  return {id, type: 'plainline', value: name, payload, color};
};

const ChartMarkView = ({value, viewBox: { x, height }}) => {
  const [expandArray, setExpandArray] = useState<boolean[]>(new Array(value.length).fill(false));

  const y = height / 2;
  const boxes: JSX.Element[] = [];

  for (let i = 0; i < value.length; i++) {
    const item = value[i], isExpanded = expandArray[i];
    const text = isExpanded ? item.expandedText : item.defaultText;

    const onClick = () => {
      setExpandArray(expandArray.map((expanded, idx) => idx === i ? !expanded : expanded));
    };
    boxes.push(<MarkTextBox key={i} x={x} y={y + i * 50} text={text} onClick={onClick}/>);
    if (isExpanded) break;
  }

  return <>{boxes}</>;
};

const MarkTextBox = ({x, y, text, onClick}: MarkTextBoxProps) => {
  const labelWidth = textWidth(text) + 8;
  return (
    <g>
      <rect x={x - 8} y={y - labelWidth / 2} width={16} height={labelWidth}/>
      <text x={x + 4} y={y} transform={`rotate(-90 ${x + 4} ${y})`} onClick={onClick}>
        {text}
      </text>
    </g>
  );
};
