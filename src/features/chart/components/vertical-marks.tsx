import type { ReactNode, CSSProperties } from 'react';
import type { Payload } from 'recharts/types/component/DefaultLegendContent';
import { createElement, useState } from 'react';
import { measureText } from 'shared/drawing';


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
  active?: boolean,
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
  active: boolean,
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
  const [values, setValues] = useState(value);

  const labels = values.map((label, i): MarkTextBoxProps & {key} => {
    const { text: activeText, active } = label;
    const text = active && activeText ? activeText : label.property.displayName;
    const textY = y + step * (i + 1);

    const onClick = activeText ? () => {
      label.active = !active;
      setValues([...values]);
    } : undefined;

    return {key: i, x, y: textY, text, color: label.color, active: active, onClick};
  });

  return labels.sort(sortMarkLabelFn).map(p => createElement(MarkTextBox, p));
};

const MarkTextBox = ({x, y, text, onClick, color}: MarkTextBoxProps) => {
  const labelWidth = measureText(text, 'normal 12px "Segoe UI", Roboto') + 8;
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

function sortMarkLabelFn(a: MarkTextBoxProps, b: MarkTextBoxProps): number {
  if (a.active) return 1;
  if (b.active) return -1;
  return 0;
}
