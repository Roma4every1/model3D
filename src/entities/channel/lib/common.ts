export function applyQuerySettings(parameters: SerializedParameter[], query: ChannelQuerySettings): void {
  if (query.limit === false) {
    parameters.push({id: 'readAllRows', type: 'bool', value: 'true'});
  } else if (Number.isInteger(query.limit)) {
    parameters.push({id: 'maxRowCount', type: 'integer', value: query.limit.toString()});
  }
  if (query.order?.length) {
    const value = query.order.map(sort => sort.column + ' ' + sort.direction).join(',');
    parameters.push({id: 'sortOrder', type: 'sortOrder', value});
  }
}

/* --- --- */

export function createColumnInfo<Fields extends string = string>(
  channel: Channel,
  criterion: ChannelCriterion<Fields>,
): ChannelColumnInfo<Fields> {
  const info = {} as ChannelColumnInfo<Fields>;
  const properties = channel.info.properties;
  const propertyNames = properties.map(property => property.name.toUpperCase());

  for (const field in criterion) {
    let propertyName: string, optional: boolean;
    const criterionItem: ChannelColumnCriterion = criterion[field];

    if (typeof criterionItem === 'string') {
      propertyName = criterionItem;
      optional = false;
    } else {
      propertyName = criterionItem.name;
      optional = criterionItem.optional;
    }
    const index = propertyNames.findIndex(name => name === propertyName);

    if (index === -1) {
      if (!optional) return null;
      info[field] = {name: propertyName, index: -1};
    } else {
      info[field] = {name: properties[index].fromColumn, index: -1};
    }
  }
  return info;
}

/** Добавляет в конфиг канала данные о колонках. */
export function findColumnIndexes(columns: ChannelColumn[], channelInfo: ChannelInfo): void {
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
    if (channelInfo.columns) for (const field in channelInfo.columns) {
      const propertyInfo = channelInfo.columns[field];
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

/** Находит и возвращает список привязанных каналов. */
export function getLinkedChannels(dict: ChannelDict): Set<ChannelName> {
  const linkedChannels = new Set<ChannelName>();
  for (const name in dict) {
    const properties = dict[name]?.info.properties;
    if (!properties) continue;

    for (const property of properties) {
      const linkedChannelName = property.secondLevelChannelName;
      if (linkedChannelName) linkedChannels.add(linkedChannelName);
    }
  }
  return linkedChannels;
}

/** Находит и возвращает список каналов-справочников. */
export function getLookupChannels(dict: ChannelDict): Set<ChannelName> {
  const lookupChannels = new Set<ChannelName>();
  for (const name in dict) {
    const lookups = dict[name]?.info.lookupChannels;
    if (!lookups) continue;
    for (const lookupName of lookups) lookupChannels.add(lookupName);
  }
  return lookupChannels;
}

/** Находит и возвращает список каналов, необходимых для параметров. */
export function getExternalChannels(parameters: Parameter[]): Set<ChannelName> {
  const externalChannels = new Set<ChannelName>();
  for (const parameter of parameters) {
    const channelName = parameter.channelName;
    if (channelName) externalChannels.add(channelName);
  }
  return externalChannels;
}
