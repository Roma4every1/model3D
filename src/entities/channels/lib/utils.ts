import { channelAPI } from './channel.api.ts';
import { fillParamValues } from 'entities/parameters';
import { findColumnIndexes } from './common';
import { createLookupChannels, createLookupColumnNames } from './lookup';


/** Наполняет каналы данными. */
export function fillChannels(channelDict: ChannelDict, paramDict: ParamDict) {
  const mapper = (channel) => fillChannel(channel, paramDict);
  return Promise.all(Object.values(channelDict).map(mapper));
}

/** Наполняет канал данными. */
export async function fillChannel(channel: Channel, paramDict: ParamDict) {
  const paramValues = fillParamValues(channel.info.parameters, paramDict, channel.info.clients);
  const resData = await channelAPI.getChannelData(channel.name, paramValues, channel.query);
  if (!resData.ok) return;

  const { data, tableID } = resData.data;
  channel.data = data;
  channel.tableID = tableID;

  const columns = data?.columns;
  const info = channel.info;
  if (columns && !info.columnApplied) findColumnIndexes(columns, info);
}


/** Создаёт новые каналы, не заполняя их данными. */
export function createChannels(names: ChannelName[]): Promise<ChannelDict> {
  return Promise.all(names.map(createChannel)).then(entries => Object.fromEntries(entries));
}

/** Создаёт объект нового канала; не заполняет данными. */
async function createChannel(name: ChannelName): Promise<[ChannelName, Channel]> {
  const resInfo = await channelAPI.getChannelInfo(name);
  if (!resInfo.ok) return [name, null];

  const info = resInfo.data;
  const properties = info.properties;

  for (const property of properties) {
    if (property.name) {
      property.name = property.name.toUpperCase();
    } else {
      property.name = property.fromColumn?.toUpperCase();
    }
  }
  info.lookupChannels = createLookupChannels(properties);
  info.lookupColumns = createLookupColumnNames(properties);

  const channel: Channel = {
    name, info, data: null, tableID: null,
    query: {maxRowCount: null, filters: null, order: []},
  };
  return [name, channel];
}
