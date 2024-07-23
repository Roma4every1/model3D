import type { ChannelConfigDTO, ChannelPropertyDTO } from './channel.types';
import { IDGenerator } from 'shared/lib';
import { channelAPI } from './channel.api';


export function createChannels(names: Iterable<ChannelName>, idGenerator: IDGenerator): Promise<ChannelDict> {
  const actions: Promise<void>[] = [];
  const { promise, resolve } = Promise.withResolvers<ChannelDict>();

  const create = async (name: ChannelName): Promise<Channel | null> => {
    const res = await channelAPI.getChannelConfig(name);
    if (!res.ok) return null;

    const id = idGenerator.get();
    return createChannelModel(id, name, res.data);
  };

  const channelDict: ChannelDict = {};
  for (const name of names) {
    const add = (c: Channel) => { if (c) channelDict[c.id] = c; };
    actions.push(create(name).then(add));
  }
  Promise.all(actions).then(() => resolve(channelDict));
  return promise;
}

export async function createChannel(id: ChannelID, name: ChannelName): Promise<Channel | null> {
  const res = await channelAPI.getChannelConfig(name);
  if (!res.ok) return null;
  return createChannelModel(id, name, res.data);
}

function createChannelModel(id: ChannelID, name: ChannelName, dto: ChannelConfigDTO): Channel {
  const properties = createProperties(dto.properties);
  const lookupColumns = createLookupColumns(properties);

  const config: ChannelConfig = {
    displayName: dto.displayName, properties, lookupColumns,
    parameterNames: dto.parameters ?? [],
    activeRowParameterName: dto.currentRowObjectName ?? null,
  };
  return {id, name, config, query: {}, data: null, actual: false};
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
      lookupChannelNames: dto.lookupChannels ?? [],
      detailChannelName: dto.secondLevelChannelName,
      file: dto.file,
    });
  }
  return properties;
}

/** Находит названия колонок для задания списка значений или списка смежностей дерева. */
function createLookupColumns(properties: ChannelProperty[]): LookupColumns {
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
