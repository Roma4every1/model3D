import { useState } from "react";
import { textWidth } from "../../../layout/left-tabs";
import { Payload } from "recharts/types/component/DefaultLegendContent";


/** Вертикальная пометка на графике.
 * + `x` — значение по оси X
 * + `value` — текст в свёрнутом и раскрытом состоянии
 * */
export interface ChartMarkProps {
  key: string,
  x: string,
  label: {content: any, value: any},
  stroke: string,
}

export const getChartMarkProto = (x: string, key: string, property: ChannelProperty, item, id): ChartMarkProps => {
  const value = property.lookupData.find(datum => datum.id === id)?.value;
  const label = {content: ChartMarkView, value: [property.displayName, value]};
  return {x, key, label, stroke: item.color};
};

const payload = {strokeDasharray: '6 6'};

export const getChartMarkLegend = (id, name, color): Payload => {
  return {id, type: 'plainline', value: name, payload, color};
};

const ChartMarkView = ({value, viewBox: { x, height }}) => {
  const [opened, setOpened] = useState(false);
  const [defaultValue, openedValue] = value;

  const y = height / 2;
  const width = (opened && openedValue) ? textWidth(openedValue) + 4 : 36;

  return (
    <>
      <rect x={x - 8} y={y - width / 2} width={16} height={width}/>
      <text x={x + 4} y={y} transform={`rotate(-90 ${x + 4} ${y})`} onClick={() => setOpened(!opened)}>
        {(opened && openedValue) ? openedValue : defaultValue}
      </text>
    </>
  );
};
