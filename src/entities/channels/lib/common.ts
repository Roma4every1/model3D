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
  const properties = channel.info.properties;
  const propertyNames = properties.map((property) => property.name.toUpperCase());

  const info = {} as ChannelColumnInfo<Fields>;
  for (const field in criterion) {
    const criterionName = criterion[field];
    const index = propertyNames.findIndex((name) => name === criterionName);

    if (index === -1) return null;
    info[field] = {name: properties[index].fromColumn, index: -1};
  }
  return info;
}

export function findColumnIndexes(columns: ChannelColumn[], info: ChannelColumnInfo | LookupColumns) {
  for (const field in info) {
    const propertyInfo = info[field];
    for (let i = 0; i < columns.length; i++) {
      const name = columns[i].Name;
      if (propertyInfo.name === name) { propertyInfo.index = i; break; }
    }
  }
}

/* --- --- */

/** Находит и возвращает список привязанных каналов. */
export function getLinkedChannels(dict: ChannelDict): Set<ChannelName> {
  const linkedChannels = new Set<ChannelName>();
  for (const name in dict) {
    const properties = dict[name].info.properties;
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
    const lookups = dict[name].info.lookupChannels;
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
