import { createWithEqualityFn } from 'zustand/traditional';
import { compareArrays, compareObjects } from 'shared/lib';


/** Хранилище каналов. */
export const useChannelStore = createWithEqualityFn((): ChannelDict => ({}));

/** Состояние канала. */
export function useChannel(name: ChannelName): Channel {
  const selector = (state: ChannelDict): Channel => state[name];
  return useChannelStore(selector);
}

/** Список каналов. */
export function useChannels(names: ChannelName[]): Channel[] {
  const selector = (state: ChannelDict): Channel[] => names.map(channel => state[channel]);
  return useChannelStore(selector, compareArrays);
}

/** Словарь каналов. */
export function useChannelDict(names: Iterable<ChannelName>): ChannelDict {
  const selector = (state: ChannelDict) => {
    const result: ChannelDict = {};
    for (const name of names) result[name] = state[name];
    return result;
  };
  return useChannelStore(selector, compareObjects);
}
