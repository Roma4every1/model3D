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
  const idName = 'LOOKUPCODE';           // стандартное название свойства с ID
  const valueName = 'LOOKUPVALUE';       // стандартное название свойства со значением
  const parentName = 'LOOKUPPARENTCODE'; // стандартное название свойства с ID родителя

  let idColumnName = idName;
  let valueColumnName = valueName;
  let parentColumnName = parentName;

  for (const { name, fromColumn } of properties) {
    if (name === idName) idColumnName = fromColumn;
    else if (name === valueName) valueColumnName = fromColumn;
    else if (name === parentName) parentColumnName = fromColumn;
  }

  return {
    id: {propertyName: idName, columnName: idColumnName, columnIndex: -1},
    value: {propertyName: valueName, columnName: valueColumnName, columnIndex: -1},
    parent: {propertyName: parentName, columnName: parentColumnName, columnIndex: -1},
  };
}
