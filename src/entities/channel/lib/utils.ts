import { channelAPI } from './channel.api';
import { fillParamValues } from 'entities/parameter';
import { findColumnIndexes } from './common';
import { createLookupChannels, createLookupColumnNames } from './lookup';


/** Наполняет каналы данными. */
export function fillChannels(channelDict: ChannelDict, paramDict: ParamDict): Promise<void[]> {
  const mapper = (channel) => fillChannel(channel, paramDict);
  return Promise.all(Object.values(channelDict).map(mapper));
}

/** Наполняет канал данными. */
export async function fillChannel(channel: Channel, paramDict: ParamDict): Promise<void> {
  const info = channel.info;
  const paramValues = fillParamValues(info.parameters, paramDict, info.clients);

  const { ok, data } = await channelAPI.getChannelData(channel.name, paramValues, channel.query);
  if (!ok) return;

  channel.data = data;
  const columns = data?.columns;
  if (columns) findColumnIndexes(columns, channel.info);
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

  const channel: Channel = {name, info, data: null, query: {}};
  return [name, channel];
}
