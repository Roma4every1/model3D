import type { ParameterUpdateEntries } from '../lib/parameter.types';
import { useParameterStore } from './parameter.store';


/** Добавить в хранилище параметры клиента сессии. */
export function addClientParameters(id: ClientID, parameters: Parameter[]): void {
  useParameterStore.setState({[id]: parameters});
}

/** Обновить значение нескольких параметров. */
export function updateParams(entries: ParameterUpdateEntries): void {
  const state = useParameterStore.getState();
  for (const { clientID, id, value } of entries) {
    const parameters = state[clientID];
    const index = parameters.findIndex(p => p.id === id);
    if (index === -1) continue;

    const parameter = parameters[index];
    parameter.setValue(value);

    parameters[index] = parameter.clone();
    state[clientID] = [...state[clientID]];
  }
  useParameterStore.setState({...state}, true);
}
