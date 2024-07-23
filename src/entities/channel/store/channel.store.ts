import { createWithEqualityFn } from 'zustand/traditional';
import { IDGenerator, compareArrays, compareObjects } from 'shared/lib';


/** Хранилище каналов для презентаций и отдельных форм. */
export interface ChannelStore {
  /** Генератор уникальных идентификаторов. */
  readonly idGenerator: IDGenerator;
  /** Хранилище экземпляров. */
  readonly storage: ChannelDict;
  /** Трекер разделяемости данных. */
  readonly sharing: Record<ChannelName, Set<ChannelID>>;
}


/** Хранилище каналов. */
export const useChannelStore = createWithEqualityFn((): ChannelStore => ({
  idGenerator: new IDGenerator(1),
  storage: {},
  sharing: {},
}));

/** Состояние канала. */
export function useChannel(id: ChannelID): Channel {
  return useChannelStore(state => state.storage[id]);
}
/** Данные канала. */
export function useChannelData(id: ChannelID): ChannelData {
  return useChannelStore(state => state.storage[id]?.data);
}

/** Список каналов. */
export function useChannels(ids: ChannelID[]): Channel[] {
  const selector = (state: ChannelStore): Channel[] => ids.map(id => state.storage[id]);
  return useChannelStore(selector, compareArrays);
}
/** Словарь каналов. */
export function useChannelDict(ids: Iterable<ChannelID>): ChannelDict {
  const selector = (state: ChannelStore) => {
    const result: ChannelDict = {};
    for (const id of ids) result[id] = state.storage[id];
    return result;
  };
  return useChannelStore(selector, compareObjects);
}
