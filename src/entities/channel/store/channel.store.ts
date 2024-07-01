import { createWithEqualityFn } from 'zustand/traditional';
import { compareArrays, compareObjects } from 'shared/lib';


/** Хранилище каналов. */
export const useChannelStore = createWithEqualityFn((): ChannelDict => ({}));

/** Состояние канала. */
export function useChannel(name: ChannelName): Channel {
  return useChannelStore(state => state[name]);
}
/** Данные канала. */
export function useChannelData(name: ChannelName): ChannelData {
  return useChannelStore(state => state[name]?.data);
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
