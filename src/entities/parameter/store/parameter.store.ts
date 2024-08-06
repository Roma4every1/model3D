import type { ParameterUpdateEntry } from '../lib/parameter.types';
import { createWithEqualityFn } from 'zustand/traditional';
import { IDGenerator, compareArrays } from 'shared/lib';


/** Стор для параметров клиентов сессии. */
export interface ParameterStore {
  /** Генератор идентификаторов параметров. */
  readonly idGenerator: IDGenerator;
  /** Хранилище параметров. */
  readonly storage: ParameterMap;
  /** Слушатели событий изменения параметров. */
  readonly listeners: Map<ParameterID, OnParameterUpdate>;
  /** Хранилище для установщиков параметров. */
  readonly setters: ParameterSetter[];
  /** Очередь обновления параметров. */
  readonly updateQueue: ParameterUpdateEntry[];
  /** Группировка параметров по клиентам. */
  clients: ParameterDict;
}


export const useParameterStore = createWithEqualityFn((): ParameterStore => ({
  idGenerator: new IDGenerator(1),
  storage: new Map(),
  listeners: new Map(),
  setters: [],
  clients: {},
  updateQueue: [],
}));

export function getParameterStorage(): ParameterMap {
  return useParameterStore.getState().storage;
}
export function useClientParameters(id: ClientID): Parameter[] {
  return useParameterStore(s => s.clients[id]);
}
export function useParameterValue(id: ParameterID): any {
  return useParameterStore(s => s.storage.get(id)?.getValue());
}
export function useParameterValues(ids: ParameterID[]): any[] {
  const selector = ({storage}: ParameterStore) => ids.map(id => storage.get(id)?.getValue());
  return useParameterStore(selector, compareArrays);
}
