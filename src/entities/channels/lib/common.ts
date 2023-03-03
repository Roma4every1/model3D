export function applyQuerySettings(paramValues: SerializedParameter[], query: ChannelQuerySettings) {
  if (query.maxRowCount) {
    const value = query.maxRowCount.toString();
    paramValues.push({id: 'maxRowCount', type: 'integer', value});
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

/** Добавляет привязанные каналы. */
export function addLinkedChannels(channel: Channel, set: Set<ChannelName>) {
  for (const property of channel.info.properties) {
    const { lookupChannelName, secondLevelChannelName } = property;
    if (lookupChannelName) set.add(lookupChannelName);
    if (secondLevelChannelName) set.add(secondLevelChannelName);
  }
}

/** Добавляет каналы, необходимые для параметров. */
export function addExternalChannels(params: Parameter[], set: Set<ChannelName>) {
  for (const param of params) {
    const channel = param.externalChannelName;
    if (channel) set.add(channel);
  }
}
