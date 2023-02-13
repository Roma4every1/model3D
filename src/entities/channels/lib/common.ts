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

/* --- Editor Columns --- */

export function findEditorColumnIndexes(columns: ChannelColumn[], editorColumns: EditorColumns) {
  const codeName = editorColumns.lookupCode.name;
  const valueName = editorColumns.lookupValue.name;
  const parentName = editorColumns.lookupParentCode.name;

  columns.forEach((column, i) => {
    const name = column.Name;
    if (name === codeName) return editorColumns.lookupCode.index = i;
    if (name === valueName) return editorColumns.lookupValue.index = i;
    if (name === parentName) return editorColumns.lookupParentCode.index = i;
  });
}

export function applyEditorColumnNames(channel: Channel) {
  let codeColumnName = 'LOOKUPCODE';
  let valueColumnName = 'LOOKUPVALUE';
  let parentColumnName = 'LOOKUPPARENTCODE';

  let codePropertyColumnName, valuePropertyColumnName, parentPropertyColumnName;
  for (const property of channel.info.properties) {
    const upper = property.name.toUpperCase();
    if (upper === codeColumnName) codePropertyColumnName = property;
    else if (upper === valueColumnName) valuePropertyColumnName = property;
    else if (upper === parentColumnName) parentPropertyColumnName = property;
  }

  if (codePropertyColumnName) {
    codeColumnName = codePropertyColumnName.fromColumn.toUpperCase();
  }
  if (valuePropertyColumnName) {
    valueColumnName = valuePropertyColumnName.fromColumn.toUpperCase();
  }
  if (parentPropertyColumnName) {
    parentColumnName = parentPropertyColumnName.fromColumn.toUpperCase();
  }

  channel.info.editorColumns = {
    lookupCode: {name: codeColumnName, index: -1},
    lookupValue: {name: valueColumnName, index: -1},
    lookupParentCode: {name: parentColumnName, index: -1},
  };
}
