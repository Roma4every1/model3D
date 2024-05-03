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
      const lookupName = item.property.lookupChannels[0];
      if (!lookupName) { item.text = item.id; continue; }

      const channel = data[lookupName];
      if (!channel || !channel.data) continue;

      const lookupColumns = channel.config.lookupColumns;
      const idIndex = lookupColumns.id.columnIndex;
      if (idIndex === -1) continue;

      const row = channel.data.rows.find(row => row[idIndex] === item.id);
      if (row) item.text = row[lookupColumns.value.columnIndex];
    }
  }
}
