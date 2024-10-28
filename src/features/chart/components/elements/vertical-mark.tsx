import type { CSSProperties } from 'react';
import type { ChartMark, ChartMarkLabel } from '../../lib/chart.types';
import { useRender } from 'shared/react';
import { measureText } from 'shared/drawing';


interface CustomVerticalMarkProps {
  viewBox: {x: number, y: number, width: number, height: number};
  value: ChartMark;
}
interface MarkTextBoxProps {
  x: number;
  y: number;
  text: string;
  color: ColorString;
  onClick?: () => void;
}

export const CustomVerticalMark = (props: CustomVerticalMarkProps) => {
  const render = useRender();
  const labels = props.value.values;
  const { x, y, height } = props.viewBox;

  const markCount = labels.length;
  const step = height / (markCount + 1);

  const toTextBox = (label: ChartMarkLabel, i: number) => {
    const { expanded, summary, details } = label;
    const text = expanded && details ? details : summary;

    const textY = y + step * (i + 1);
    const color = label.property.color;

    const onClick = !details ? undefined : () => {
      label.expanded = !expanded;
      render();
    };
    return <MarkTextBox key={i} x={x} y={textY} text={text} color={color} onClick={onClick}/>;
  };
  return labels.sort(compareMarkLabels).map(toTextBox);
};

const MarkTextBox = ({x, y, text, color, onClick}: MarkTextBoxProps) => {
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

function compareMarkLabels(a: ChartMarkLabel, b: ChartMarkLabel): number {
  if (a.expanded) return 1;
  if (b.expanded) return -1;
  return 0;
}
