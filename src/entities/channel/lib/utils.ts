import { serializeParameter } from 'entities/parameter';
import { channelAPI } from './channel.api';


/** Наполняет канал данными. */
export async function fillChannel(channel: Channel, parameters: Parameter[]): Promise<void> {
  const payload = parameters.map(serializeParameter);
  const res = await channelAPI.getChannelData(channel.name, payload, channel.query);

  if (res.ok) {
    channel.data = res.data;
    updateChannelLookupColumns(channel);
  } else {
    channel.data = null;
  }
  channel.actual = true;
}

export function updateChannelLookupColumns(channel: Channel): void {
  const data = channel.data;
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
