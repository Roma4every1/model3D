import { hasIntersection } from 'shared/lib';
import { useProgramStore } from './program.store';


/** Установить список программ для презентации. */
export function setClientPrograms(owner: ClientID, programs: Program[]): void {
  const currentModels = useProgramStore.getState().models;
  useProgramStore.setState({models: {...currentModels, [owner]: programs}});
}

/** Установить статус операции (если нет - добавить). */
export function setOperationStatus(status: Partial<OperationStatus>): void {
  const operations = useProgramStore.getState().operations;
  const operationID = status.id;

  const index = operations.findIndex(o => o.id === operationID);
  if (index === -1) {
    useProgramStore.setState({operations: [status as OperationStatus, ...operations]});
  } else {
    operations[index] = {...operations[index], ...status};
    useProgramStore.setState({operations: [...operations]});
  }
}

/** Очистить активные операции для презентации или целиком. */
export function clearOperations(clientID: ClientID | null): void {
  if (!clientID) return useProgramStore.setState({operations: []});
  const operations = useProgramStore.getState().operations.filter(o => o.clientID !== clientID);
  useProgramStore.setState({operations});
}

/** Сбрасывает флаги актуальности каналов и доступности программ. */
export function resetDependentPrograms(changes: Set<ParameterID>): void {
  const state = useProgramStore.getState();
  const models = state.models;

  for (const client in models) {
    for (const program of models[client]) {
      const ap = program.availabilityParameters;
      if (ap.length && hasIntersection(changes, ap)) program.available = undefined;

      const channels = program.channels;
      if (!channels) continue;

      for (const channelName in channels) {
        const channel = channels[channelName];
        if (hasIntersection(changes, channel.config.parameters)) channel.actual = false;
      }
      if (hasIntersection(changes, program.relations.values())) program.checkRelations = true;
    }
  }
}
