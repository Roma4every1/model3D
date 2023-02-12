/** Данные канала. */
export function channelSelector(this: ChannelName, state: WState): Channel {
  return state.channels[this];
}

/** Данные каналов; **обязательно использование функции сравнения**. */
export function channelsSelector(this: ChannelName[], state: WState): Channel[] {
  return this.map(channel => state.channels[channel]);
}
