/** Данные канала. */
export function channelSelector(this: ChannelName, state: WState): Channel {
  return state.channels[this];
}

/** Данные каналов; **обязательно использование функции сравнения**. */
export function channelsSelector(this: ChannelName[], state: WState): Channel[] {
  return this.map(channel => state.channels[channel]);
}

/** Данные каналов в виде словаря; **обязательно использование функции сравнения**. */
export function channelDictSelector(this: ChannelName[], state: WState): ChannelDict {
  const result = {};
  const channels = state.channels;
  for (const name of this) result[name] = channels[name];
  return result;
}
