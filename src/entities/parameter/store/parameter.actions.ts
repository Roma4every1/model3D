import type { ParameterInit } from '../lib/parameter.types';
import { createParameter, parameterCompareFn } from '../lib/factory';
import { useParameterStore } from './parameter.store';


export function addClientParameters(id: ClientID, inits: ParameterInit[]): Parameter[] {
  const state = useParameterStore.getState();
  const { storage, clients, idGenerator } = state;

  const toParameter = (init: ParameterInit): Parameter => {
    const id = idGenerator.get();
    const parameter = createParameter(id, init);
    storage.set(id, parameter);
    return parameter;
  };

  const parameters = inits.map(toParameter).sort(parameterCompareFn);
  clients[id] = parameters;
  return parameters;
}

export function addParameterListener(id: ParameterID, listener: OnParameterUpdate): void {
  useParameterStore.getState().listeners.set(id, listener);
}

export function clearParameterStore(): void {
  const { idGenerator, storage, listeners } = useParameterStore.getState();
  storage.clear();
  listeners.clear();
  idGenerator.reset();
  useParameterStore.setState({clients: {}, setters: [], updateQueue: []});
}

export function setParameterLock(id: ParameterID, lock: boolean): void {
  const state = useParameterStore.getState();
  const parameter = state.storage.get(id);
  if (!parameter || !parameter.editor || parameter.editor.disabled === lock) return;

  for (const clientID in state.clients) {
    if (!state.clients[clientID].includes(parameter)) continue;
    state.clients[clientID] = [...state.clients[clientID]];
    break;
  }
  parameter.editor.disabled = lock;
  useParameterStore.setState({...state}, true);
}
