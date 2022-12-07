import { useState } from "react";
import { ReferenceLine } from "recharts";
import { textWidth } from "../../../utils/layout.utils";


/** Пометка на графике. */
export type ChartMark = [string, string | undefined];


/** Селектор вертикальных пометок. */
export function chartMarksSelector(this: {channelName: ChannelName, dateFn: any}, state: WState): ChartMark[] {
  const { channelName, dateFn } = this;
  const channel = state.channelsData[channelName];
  const channelRows: any[] = channel?.data.Rows;
  if (!channelRows || !channelRows.length) return [];

  const descRows: any[] = channel.properties.find(p => p.lookupData)?.lookupData;
  if (!descRows || !descRows.length) return channelRows.map(row => [dateFn(row.Cells[0]), undefined]);
  return channelRows.map((x) => {
    const [timestamp, descID] = x.Cells;
    return [dateFn(timestamp), descRows.find(i => i.id === descID).value];
  });
}


/** Отображение списка пометок графика в элементы интерфейса. */
export function mapChartMarks(mark: ChartMark) {
  return <ReferenceLine key={mark[0]} x={mark[0]} label={{value: mark[1], content: ChartMarkView}}/>;
}

function ChartMarkView({value, viewBox: { x, height }}) {
  const [opened, setOpened] = useState(false);

  const y = height / 2;
  const textW = (opened && value) ? textWidth(value) + 4 : 36;

  return (
    <>
      <rect x={x - 8} y={y - textW / 2} width={16} height={textW}/>
      <text x={x + 4} y={y} transform={`rotate(-90 ${x + 4} ${y})`} onClick={() => setOpened(!opened)}>
        {(opened && value) ? value : 'ТКРС'}
      </text>
    </>
  );
}
