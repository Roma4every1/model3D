import { channelAPI } from './channel.api';
import { fillParamValues } from 'entities/parameter';
import { findColumnIndexes } from './common';
import { createChannel } from './factory';


/** Наполняет каналы данными. */
export function fillChannels(channelDict: ChannelDict, paramDict: ParamDict): Promise<void[]> {
  const mapper = (channel) => fillChannel(channel, paramDict);
  return Promise.all(Object.values(channelDict).map(mapper));
}

/** Наполняет канал данными. */
export async function fillChannel(channel: Channel, paramDict: ParamDict): Promise<void> {
  const config = channel.config;
  const paramValues = fillParamValues(config.parameters, paramDict, config.clients);

  const { ok, data } = await channelAPI.getChannelData(channel.name, paramValues, channel.query);
  if (!ok) return;

  channel.data = data;
  const columns = data?.columns;
  if (columns) findColumnIndexes(columns, config);
}


/** Создаёт новые каналы, не заполняя их данными. */
export function createChannels(names: ChannelName[]): Promise<ChannelDict> {
  return Promise.all(names.map(fetchChannel)).then(entries => Object.fromEntries(entries));
}

/** Создаёт объект нового канала; не заполняет данными. */
async function fetchChannel(name: ChannelName): Promise<[ChannelName, Channel]> {
  const res = await channelAPI.getChannelConfig(name);
  if (!res.ok) return [name, null];
  return [name, createChannel(name, res.data)];
}
