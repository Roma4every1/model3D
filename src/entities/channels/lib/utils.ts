import { channelsAPI } from './channels.api';
import { fillParamValues } from 'entities/parameters';
import { findEditorColumnIndexes } from './common';


/** Наполняет каналы данными. */
export function fillChannels(channelDict: ChannelDict, paramDict: ParamDict) {
  const mapper = ([name, channel]) => fillChannel(name, channel, paramDict);
  return Promise.all(Object.entries(channelDict).map(mapper));
}

/** Наполняет канал данными. */
export async function fillChannel(name: ChannelName, channel: Channel, paramDict: ParamDict) {
  const paramValues = fillParamValues(channel.info.parameters, paramDict, channel.info.clients);
  const resData = await channelsAPI.getChannelData(name, paramValues);
  if (!resData.ok) return;

  const { data, tableID } = resData.data;
  channel.data = data;
  channel.tableID = tableID;

  const columns = data?.columns;
  const editorColumns = channel.info.editorColumns;
  if (editorColumns && columns) findEditorColumnIndexes(columns, editorColumns);
}


/** Создаёт новые каналы, не заполняя их данными. */
export function createChannels(names: ChannelName[]): Promise<ChannelDict> {
  return Promise.all(names.map(createChannel)).then((entries) => Object.fromEntries(entries));
}

/** Создаёт объект нового канала; не заполняет данными. */
async function createChannel(name: ChannelName): Promise<[ChannelName, Channel]> {
  const resInfo = await channelsAPI.getChannelInfo(name);
  if (!resInfo.ok) return;
  return [name, {info: resInfo.data, data: null, tableID: null}];
}
