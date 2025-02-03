import { createWithEqualityFn } from 'zustand/traditional';
import { IDGenerator, compareArrays, compareObjects } from 'shared/lib';
import { ChannelDataManager } from '../lib/manager';


/** Хранилище каналов для презентаций и отдельных форм. */
export interface ChannelStore {
  /** Генератор уникальных идентификаторов. */
  readonly idGenerator: IDGenerator;
  /** Хранилище экземпляров. */
  readonly storage: ChannelDict;
  /** Трекер разделяемости данных. */
  readonly sharing: Record<ChannelName, Set<ChannelID>>;
  /** Класс, управляющий обновлением данных. */
  readonly dataManager: ChannelDataManager;
}

/** Хранилище каналов. */
export const useChannelStore = createWithEqualityFn((): ChannelStore => {
  const storage: ChannelDict = {};
  const idGenerator = new IDGenerator(1);
  const dataManager = new ChannelDataManager(storage);
  return {idGenerator, storage, sharing: {}, dataManager};
});

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
