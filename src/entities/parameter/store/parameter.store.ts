import { createWithEqualityFn } from 'zustand/traditional';
import { IDGenerator, compareArrays } from 'shared/lib';


export interface ParameterStore {
  readonly idGenerator: IDGenerator;
  readonly storage: ParameterMap;
  readonly listeners: Map<ParameterID, OnParameterUpdate>;
  setters: ParameterSetter[];
  clients: ParameterDict;
  updateQueue: {id: ParameterID, newValue: any, resolve: () => void}[];
}


export const useParameterStore = createWithEqualityFn((): ParameterStore => ({
  idGenerator: new IDGenerator(1),
  storage: new Map(),
  listeners: new Map(),
  setters: [],
  clients: {},
  updateQueue: [],
}));

export function useParameterStorage(): ParameterMap {
  // ссылка на storage никогда не меняется
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
