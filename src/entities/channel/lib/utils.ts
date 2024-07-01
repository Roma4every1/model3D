import { channelAPI } from './channel.api';
import { findParameters } from 'entities/parameter';


/** Наполняет каналы данными. */
export function fillChannels(channelDict: ChannelDict, storage: ParameterMap): Promise<void[]> {
  const callback = (channel: Channel): Promise<void> => {
    const parameters = findParameters(channel.config.parameters, storage);
    return fillChannel(channel, parameters);
  };
  return Promise.all(Object.values(channelDict).map(callback));
}

/** Наполняет канал данными. */
export async function fillChannel(channel: Channel, parameters: Parameter[]): Promise<void> {
  const { ok, data } = await channelAPI.getChannelData(channel.name, parameters, channel.query);
  channel.actual = true;

  if (ok) {
    channel.data = data;
  } else {
    channel.data = null; return;
  }

  const { id: idInfo, value: valueInfo, parent: parentInfo } = channel.config.lookupColumns;
  if (data) {
    idInfo.columnIndex = data.columns.findIndex(c => c.name === idInfo.columnName);
    valueInfo.columnIndex = data.columns.findIndex(c => c.name === valueInfo.columnName);
    parentInfo.columnIndex = data.columns.findIndex(c => c.name === parentInfo.columnName);
  } else {
    idInfo.columnIndex = -1;
    valueInfo.columnIndex = -1;
    parentInfo.columnIndex = -1;
  }
}
