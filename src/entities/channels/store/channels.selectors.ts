/** Состояние канала. */
export function channelSelector(this: ChannelName, state: WState): Channel {
  return state.channels[this];
}

/** Список каналов; **обязательно использование функции сравнения**. */
export function channelsSelector(this: ChannelName[], state: WState): Channel[] {
  return this.map(channel => state.channels[channel]);
}

/** Словарь каналов; **обязательно использование функции сравнения**. */
export function channelDictSelector(this: ChannelName[], state: WState): ChannelDict {
  const result: ChannelDict = {};
  const channels = state.channels;
  for (const name of this) result[name] = channels[name];
  return result;
}

/** Данные каналов в виде словаря; **обязательно использование функции сравнения**. */
export function channelDataDictSelector(this: ChannelName[], state: WState): ChannelDataDict {
  const result: ChannelDataDict = {};
  const channels = state.channels;
  for (const name of this) result[name] = channels[name]?.data ?? null;
  return result;
}
