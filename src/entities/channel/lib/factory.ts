import type { ChannelConfigDTO, ChannelPropertyDTO } from './channel.types';


export function createChannel(name: ChannelName, dto: ChannelConfigDTO): Channel {
  const properties = createProperties(dto.properties);
  const lookupChannels = createLookupChannels(properties);
  const lookupColumns = createLookupColumnNames(properties);

  const config: ChannelConfig = {
    displayName: dto.displayName,
    properties, parameters: dto.parameters ?? [],
    lookupChannels, lookupColumns,
    activeRowParameter: dto.currentRowObjectName,
  };
  return {name, config, data: null, query: {}};
}

function createProperties(init: ChannelPropertyDTO[]): ChannelProperty[] {
  const names: Set<string> = new Set();
  const properties: ChannelProperty[] = [];

  for (const dto of init) {
    const name = dto.name?.toUpperCase() ?? dto?.fromColumn.toUpperCase();
    if (!name || names.has(name)) continue;
    names.add(name);

    properties.push({
      name, fromColumn: dto.fromColumn,
      displayName: dto.displayName,
      treePath: dto.treePath ?? [],
      lookupChannels: dto.lookupChannels ?? [],
      detailChannel: dto.secondLevelChannelName,
      file: dto.file,
    });
  }
  return properties;
}

/** Находит все каналы справочники по набору свойств. */
function createLookupChannels(properties: ChannelProperty[]): ChannelName[] {
  const result: Set<ChannelName> = new Set();
  for (const property of properties) {
    for (const name of property.lookupChannels) {
      result.add(name);
    }
  }
  return [...result];
}

/** Находит названия колонок для задания списка значений или списка смежностей дерева. */
function createLookupColumnNames(properties: ChannelProperty[]): LookupColumns {
  let idColumnName = 'LOOKUPCODE';           // стандартное название свойства с ID
  let valueColumnName = 'LOOKUPVALUE';       // стандартное название свойства со значением
  let parentColumnName = 'LOOKUPPARENTCODE'; // стандартное название свойства с ID родителя

  let idPropertyColumnName, valuePropertyColumnName, parentPropertyColumnName;
  for (const property of properties) {
    const name = property.name;
    if (name === idColumnName) idPropertyColumnName = property;
    else if (name === valueColumnName) valuePropertyColumnName = property;
    else if (name === parentColumnName) parentPropertyColumnName = property;
  }

  if (idPropertyColumnName) idColumnName = idPropertyColumnName.fromColumn;
  if (valuePropertyColumnName) valueColumnName = valuePropertyColumnName.fromColumn;
  if (parentPropertyColumnName) parentColumnName = parentPropertyColumnName.fromColumn;

  return {
    id: {name: idColumnName, index: -1},
    value: {name: valueColumnName, index: -1},
    parent: {name: parentColumnName, index: -1},
  };
}
