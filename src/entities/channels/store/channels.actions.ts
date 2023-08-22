import { ChannelActionType, ChannelAction } from './channels.reducer';


/** Добавляет несколько каналов в хранилище. */
export function setChannels(channels: ChannelDict): ChannelAction {
  return {type: ChannelActionType.SET_CHANNELS, payload: channels};
}

/** Перезаписывает данные канала. */
export function setChannelData(name: ChannelName, data: ChannelData, tableID: TableID): ChannelAction {
  return {type: ChannelActionType.SET_CHANNEL_DATA, payload: {name, data, tableID}};
}

/** Перезаписывает данные нескольких каналов. */
export function setChannelsData(payload: ChannelDataEntries): ChannelAction {
  return {type: ChannelActionType.SET_CHANNELS_DATA, payload};
}

/** Добавляет или перезаписывает данные о порядке строк. */
export function setChannelSortOrder(name: ChannelName, order: SortOrder): ChannelAction {
  return {type: ChannelActionType.SET_SORT_ORDER, payload: {name, order}};
}

/** Перезаписывает ограничитель количества строк. */
export function setChannelMaxRowCount(name: ChannelName, count: number | null): ChannelAction {
  return {type: ChannelActionType.SET_MAX_ROW_COUNT, payload: {name, count}};
}

/** Задаёт активную запись канала. */
export function setChannelActiveRow(name: ChannelName, row: ChannelRow): ChannelAction {
  return {type: ChannelActionType.SET_ACTIVE_ROW, payload: {name, row}};
}

/** Очищает данные всех каналов. */
export function clearChannels(): ChannelAction {
  return {type: ChannelActionType.CLEAR};
}
