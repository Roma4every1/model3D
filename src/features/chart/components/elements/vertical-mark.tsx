import type { ReactElement, CSSProperties } from 'react';
import type { ChartMarkLabel } from '../../lib/chart.types';
import { useRender } from 'shared/react';
import { measureText } from 'shared/drawing';


interface CustomVerticalMarkProps {
  viewBox: {x: number, y: number, width: number, height: number};
  value: ChartMarkLabel[];
}
interface MarkTextBoxProps {
  x: number;
  y: number;
  label: ChartMarkLabel;
  onClick?: () => void;
}

export const CustomVerticalMark = (props: CustomVerticalMarkProps) => {
  const render = useRender();
  const { x, y, height } = props.viewBox;

  const labels = props.value;
  const step = height / (labels.length + 1);

  const toTextBox = (label: ChartMarkLabel, i: number) => {
    const textY = y + step * (i + 1);
    let onClick: () => void;

    if (label.details) onClick = () => {
      label.expanded = !label.expanded;
      render();
    };
    return <MarkLabel key={i} x={x} y={textY} label={label} onClick={onClick}/>;
  };
  return labels.map(toTextBox).sort(compareLabels);
};

const MarkLabel = ({x, y, label, onClick}: MarkTextBoxProps) => {
  const { summary, details } = label;
  const text = label.expanded && details ? details : summary;
  const color = label.property.color;

  const labelWidth = measureText(text, '12px Roboto') + 8;
  const style: CSSProperties = {cursor: onClick ? 'pointer' : 'default'};

  return (
    <g onClick={onClick} style={style}>
      <rect
        x={x - 8} y={y - labelWidth / 2} width={16} height={labelWidth}
        fill={'#fefefe'} stroke={color}
      />
      <text x={x + 4} y={y} transform={`rotate(-90 ${x + 4} ${y})`}>{text}</text>
    </g>
  );
};

function compareLabels(a: ReactElement, b: ReactElement): number {
  if (a.props.label.expanded) return 1;
  if (b.props.label.expanded) return -1;
  return 0;
}
