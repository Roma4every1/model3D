import { ChartMarkProps } from '../components/vertical-marks';


/** Возвращает список имён всех необходимых каналов-справочников. */
export function getChartLookups(marks: ChartMarkProps[]): ChannelName[] {
  const lookups: ChannelName[] = [];
  for (const mark of marks) {
    for (const item of mark.label.value) {
      lookups.push(item.property.lookupChannels[0]);
    }
  }
  return lookups;
}

/** Устанавливает значения текста вертикальным пометкам. */
export function applyLookupToMarks(marks: ChartMarkProps[], data: ChannelDict) {
  for (const mark of marks) {
    for (const item of mark.label.value) {
      const channel = data[item.property.lookupChannels[0]];
      const lookupColumns = channel.info.lookupColumns;

      const idIndex = lookupColumns.id.index;
      if (idIndex === -1) continue;

      const row = channel.data?.rows.find(row => row.Cells[idIndex] === item.id);
      if (row) item.text = row.Cells[lookupColumns.value.index];
    }
  }
}
