import { ChannelsAction, ChannelsActions } from './channels.reducer';


/** Добавляет канал в хранилище. */
export const setChannel = (name: ChannelName, channel: Channel): ChannelsAction => {
  return {type: ChannelsActions.SET_CHANNEL, payload: {name, channel}};
};

/** Добавляет несколько каналов в хранилище. */
export const setChannels = (channels: ChannelDict): ChannelsAction => {
  return {type: ChannelsActions.SET_CHANNELS, payload: channels};
};

/** Перезаписывает данные канала. */
export const setChannelData = (name: ChannelName, data: ChannelData, tableID: TableID): ChannelsAction => {
  return {type: ChannelsActions.SET_CHANNEL_DATA, payload: {name, data, tableID}};
};

/** Перезаписывает данные нескольких каналов. */
export const setChannelsData = (payload: ChannelDataEntries): ChannelsAction => {
  return {type: ChannelsActions.SET_CHANNELS_DATA, payload};
};

/** Добавляет или перезаписывает данные о порядке строк. */
export const setChannelSortOrder = (name: ChannelName, order: SortOrder): ChannelsAction => {
  return {type: ChannelsActions.SET_SORT_ORDER, payload: {name, order}};
};

/** Перезаписывает ограничитель количества строк. */
export const setChannelMaxRowCount = (name: ChannelName, count: number | null): ChannelsAction => {
  return {type: ChannelsActions.SET_MAX_ROW_COUNT, payload: {name, count}};
};

/** Очищает данные всех каналов. */
export const clearChannels = (): ChannelsAction => {
  return {type: ChannelsActions.CLEAR};
};
