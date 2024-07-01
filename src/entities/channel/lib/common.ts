/** Конвертирует строки канала из массивов ячеек в словари по названиям колонок. */
export function cellsToRecords(data: ChannelData): ChannelRecord[] {
  if (!data) return [];
  const create = (row: ChannelRow) => {
    const record: ChannelRecord = {};
    data.columns.forEach((column, i) => {
      record[column.name] = row[i];
    });
    return record;
  };
  return data.rows.map(create);
}

/** Конвертирует строку канала из ячеек в словарь по названиям колонок. */
export function channelRowToRecord(row: ChannelRow, columns: ChannelColumn[]): ChannelRecord {
  const record: ChannelRecord = {};
  columns.forEach((column, i) => {
    record[column.name] = row[i];
  });
  return record;
}

/** Находит и возвращает список каналов детализации. */
export function getDetailChannels(dict: ChannelDict): Set<ChannelName> {
  const linkedChannels = new Set<ChannelName>();
  for (const name in dict) {
    const properties = dict[name]?.config.properties;
    if (!properties) continue;

    for (const property of properties) {
      const detailChannel = property.detailChannel;
      if (detailChannel) linkedChannels.add(detailChannel);
    }
  }
  return linkedChannels;
}
