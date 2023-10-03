export function applyQuerySettings(paramValues: SerializedParameter[], query: ChannelQuerySettings) {
  if (query.maxRowCount) {
    paramValues.push({id: 'readAllRows', type: 'bool', value: 'false'});
    paramValues.push({id: 'maxRowCount', type: 'integer', value: query.maxRowCount.toString()});
  }
  if (query.order.length) {
    const value = query.order.map(sort => sort.column + ' ' + sort.direction).join(',');
    paramValues.push({id: 'sortOrder', type: 'sortOrder', value});
  }
}

/** По ID таблиц находит нужные каналы. */
export function findChannelsByTables(ids: TableID[], channels: ChannelDict): ChannelName[] {
  const channelNames: ChannelName[] = [];
  for (const id of ids) {
    for (const name in channels) {
      const tableID = channels[name].tableID;
      if (tableID === id) channelNames.push(name);
    }
  }
  return channelNames;
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
    for (const property of channelInfo.properties) {
      if (property.fromColumn === column.Name) {
        property.type = column.NetType;
      }
    }
    for (const field in channelInfo.lookupColumns) {
      const propertyInfo = channelInfo.lookupColumns[field];
      if (propertyInfo.name === column.Name) {
        propertyInfo.index = i;
      }
    }
    if (channelInfo.columns) for (const field in channelInfo.columns) {
      const propertyInfo = channelInfo.columns[field];
      if (propertyInfo.name === column.Name) {
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
    const cells = row.Cells;
    const record: ChannelRecord = {};

    data.columns.forEach((column, i) => {
      record[column.Name] = cells[i];
    });
    return record;
  };
  return data.rows.map(create);
}

/** Конвертирует строку канала из ячеек в словарь по названиям колонок. */
export function channelRowToRecord(row: ChannelRow, columns: ChannelColumn[]): ChannelRecord {
  const cells = row.Cells;
  const record: ChannelRecord = {};

  columns.forEach((column, i) => {
    record[column.Name] = cells[i];
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
export function getExternalChannels(params: Parameter[]): Set<ChannelName> {
  const externalChannels = new Set<ChannelName>();
  for (const param of params) {
    const channel = param.externalChannelName;
    if (channel) externalChannels.add(channel);
  }
  return externalChannels;
}
