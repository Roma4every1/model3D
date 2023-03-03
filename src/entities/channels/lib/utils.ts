import { channelsAPI } from './channels.api';
import { fillParamValues } from 'entities/parameters';
import { findLookupColumnIndexes, findLookupChannels } from './lookup';


/** Наполняет каналы данными. */
export function fillChannels(channelDict: ChannelDict, paramDict: ParamDict) {
  const mapper = (channel) => fillChannel(channel, paramDict);
  return Promise.all(Object.values(channelDict).map(mapper));
}

/** Наполняет канал данными. */
export async function fillChannel(channel: Channel, paramDict: ParamDict) {
  const paramValues = fillParamValues(channel.info.parameters, paramDict, channel.info.clients);
  const resData = await channelsAPI.getChannelData(channel.name, paramValues, channel.query);
  if (!resData.ok) return;

  const { data, tableID } = resData.data;
  channel.data = data;
  channel.tableID = tableID;

  const columns = data?.columns;
  if (columns) findLookupColumnIndexes(columns, channel.info.lookupColumns);
}


/** Создаёт новые каналы, не заполняя их данными. */
export function createChannels(names: ChannelName[]): Promise<ChannelDict> {
  return Promise.all(names.map(createChannel)).then((entries) => Object.fromEntries(entries));
}

/** Создаёт объект нового канала; не заполняет данными. */
async function createChannel(name: ChannelName): Promise<[ChannelName, Channel]> {
  const resInfo = await channelsAPI.getChannelInfo(name);
  if (!resInfo.ok) return;

  const info = resInfo.data;
  info.lookupChannels = findLookupChannels(info.properties);

  for (const property of info.properties) {
    if (!property.name) property.name = property.fromColumn;
  }

  const channel: Channel = {
    name, info, data: null, tableID: null,
    query: {maxRowCount: null, filters: null, order: []},
  };
  return [name, channel];
}
