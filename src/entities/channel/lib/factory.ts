import type { ChannelConfigDTO, ChannelPropertyDTO } from './channel.types';
import { channelAPI } from './channel.api';


/** Создаёт новые каналы, не заполняя их данными. */
export async function createChannels(names: ChannelName[], resolve: PNameResolve): Promise<ChannelDict> {
  const dict: ChannelDict = {};
  await Promise.all(names.map(async (name: ChannelName): Promise<void> => {
    const res = await channelAPI.getChannelConfig(name);
    if (!res.ok) return;
    dict[name] = createChannel(name, res.data, resolve);
  }));
  return dict;
}

function createChannel(name: ChannelName, dto: ChannelConfigDTO, resolve: PNameResolve): Channel {
  const properties = createProperties(dto.properties);
  const lookupChannels = createLookupChannels(properties);
  const lookupColumns = createLookupColumnNames(properties);

  const parameterNames = dto.parameters ?? [];
  const parameters = parameterNames.map(resolve).filter(Boolean);

  const config: ChannelConfig = {
    displayName: dto.displayName,
    properties, parameters, parameterNames, lookupChannels, lookupColumns,
    activeRowParameter: resolve(dto.currentRowObjectName),
  };
  return {name, config, data: null, query: {}, actual: false};
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
