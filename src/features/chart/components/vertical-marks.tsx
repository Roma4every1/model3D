import { ReactNode, CSSProperties, useState } from 'react';
import { Payload } from 'recharts/types/component/DefaultLegendContent';
import { measureText } from 'shared/lib';


/** Вертикальная пометка на графике. */
export interface ChartMarkProps {
  /** ID метки. */
  key: string,
  /** Координата метки по X. */
  x: string,
  /** ID соответствующей оси по Y. */
  yAxisId?: string,
  /** Подписи (текст и прямоугольник). */
  label: {content: (props: ChartMarkViewProps) => ReactNode, value: ChartMarkLabelItem[]},
}

/** Подпись на вертикальной пометке. */
interface ChartMarkLabelItem {
  id: string,
  text?: string,
  property: ChannelProperty,
  color: string,
}

interface ChartMarkViewProps {
  value: ChartMarkLabelItem[],
  viewBox: {x: number, y: number, width: number, height: number},
}
interface MarkTextBoxProps {
  x: number,
  y: number,
  text: string,
  color: string,
  onClick: () => void,
}


export const getChartMarkProto = (
  x: string, key: string, property: ChannelProperty,
  item: SeriesSettingsItem, id: string,
): ChartMarkProps => {
  const value = [{id, property, color: item.color}];
  return {x, key, label: {content: ChartMarkView, value}};
};

export const getChartMarkLegend = (id: string, name: string, color: string): Payload => {
  return {id, type: 'plainline', value: name, payload: {strokeDasharray: '6 6'}, color};
};

const ChartMarkView = ({value, viewBox: { x, y, height }}: ChartMarkViewProps) => {
  const markCount = value.length;
  const step = height / (markCount + 1);
  const [expandArray, setExpandArray] = useState<boolean[]>(new Array(markCount).fill(false));

  return value.map((item , i) => {
    const text = expandArray[i] && item.text ? item.text : item.property.displayName;
    const textY = y + step * (i + 1);

    const onClick = item.text ? () => {
      setExpandArray(expandArray.map((expanded, idx) => idx === i ? !expanded : expanded));
    } : undefined;

    return <MarkTextBox key={i} x={x} y={textY} text={text} color={item.color} onClick={onClick}/>;
  });
};

const MarkTextBox = ({x, y, text, onClick, color}: MarkTextBoxProps) => {
  const labelWidth = measureText(text) + 8;
  const style: CSSProperties = {cursor: onClick ? 'pointer' : 'default'};

  return (
    <g onClick={onClick} style={style}>
      <rect x={x - 8} y={y - labelWidth / 2} width={16} height={labelWidth} stroke={color}/>
      <text x={x + 4} y={y} transform={`rotate(-90 ${x + 4} ${y})`} textAnchor={'middle'}>
        {text}
      </text>
    </g>
  );
};
