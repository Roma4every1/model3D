export function createColumnInfo(channel: Channel, criterion: ChannelCriterion): ChannelColumnInfo {
  const info: ChannelColumnInfo = {};
  const properties = channel.config.properties;
  const propertyNames = properties.map(property => property.name.toUpperCase());

  for (const field in criterion) {
    let { name: propertyName, optional } = criterion[field];
    const index = propertyNames.findIndex(name => name === propertyName);

    if (index === -1) {
      if (optional !== true) return null;
      info[field] = {name: propertyName, index: -1};
    } else {
      info[field] = {name: properties[index].fromColumn, index: -1};
    }
  }
  return info;
}

/** Добавляет в конфиг канала данные о колонках. */
export function findColumnIndexes(columns: ChannelColumn[], channelInfo: ChannelConfig): void {
  columns.forEach((column: ChannelColumn, i: number) => {
    if (!channelInfo.columnApplied) for (const property of channelInfo.properties) {
      if (property.fromColumn === column.name) {
        property.type = column.type;
      }
    }
    for (const field in channelInfo.lookupColumns) {
      const propertyInfo = channelInfo.lookupColumns[field];
      if (propertyInfo.name === column.name) {
        propertyInfo.index = i;
      }
    }
  });
  channelInfo.columnApplied = true;
}

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

/* --- --- */

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

/** Находит и возвращает список каналов-справочников. */
export function getLookupChannels(dict: ChannelDict): Set<ChannelName> {
  const lookupChannels = new Set<ChannelName>();
  for (const name in dict) {
    const lookups = dict[name]?.config.lookupChannels;
    if (!lookups) continue;
    for (const lookupName of lookups) lookupChannels.add(lookupName);
  }
  return lookupChannels;
}
