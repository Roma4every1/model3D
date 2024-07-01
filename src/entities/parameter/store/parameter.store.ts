import { createWithEqualityFn } from 'zustand/traditional';
import { IDGenerator } from 'shared/lib';


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

export function useClientParameters(id: ClientID): Parameter[] {
  const selector = (s: ParameterStore) => s.clients[id];
  return useParameterStore(selector);
}
export function useClientParameterValue(id: ClientID, name: ParameterName): any {
  const selector = (s: ParameterStore) => s.clients[id].find(p => p.name === name)?.getValue();
  return useParameterStore(selector);
}

export function useParameters(ids: ParameterID[]): Parameter[] {
  const selector = (s: ParameterStore) => ids.map(id => s.storage.get(id));
  return useParameterStore(selector, compareParameterArrays);
}
function compareParameterArrays(a: Parameter[], b: Parameter[]): boolean {
  if (!a || !b) return a === b;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    const ap = a[i], bp = b[i];
    if (ap !== bp) return false;
    if (ap && ap.getValue() !== bp.getValue()) return false;
  }
  return true;
}
