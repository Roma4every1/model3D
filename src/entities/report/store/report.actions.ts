import { hasIntersection } from 'shared/lib';
import { useReportStore } from './report.store';


/** Создать новые отчёты/программы для презентации. */
export function setReportModels(owner: ClientID, models: ReportModel[]): void {
  const currentModels = useReportStore.getState().models;
  useReportStore.setState({models: {...currentModels, [owner]: models}});
}

/** Установить статус операции (если нет - добавить). */
export function setOperationStatus(status: Partial<OperationStatus>): void {
  const operations = useReportStore.getState().operations;
  const operationID = status.id;

  const index = operations.findIndex(o => o.id === operationID);
  if (index === -1) {
    useReportStore.setState({operations: [status as OperationStatus, ...operations]});
  } else {
    operations[index] = {...operations[index], ...status};
    useReportStore.setState({operations: [...operations]});
  }
}

/** Очистить активные операции для презентации или целиком. */
export function clearOperations(clientID: ClientID | null): void {
  if (!clientID) return useReportStore.setState({operations: []});
  const operations = useReportStore.getState().operations.filter(o => o.clientID !== clientID);
  useReportStore.setState({operations});
}

/** Сбрасывает флаги актуальности каналов и доступности процедур. */
export function resetDependentReports(changes: Set<ParameterID>): void {
  const state = useReportStore.getState();
  const models = state.models;

  for (const client in models) {
    for (const report of models[client]) {
      const ap = report.availabilityParameters;
      if (ap.length && hasIntersection(changes, ap)) report.available = undefined;

      const channels = report.channels;
      if (!channels) continue;

      for (const channelName in channels) {
        const channel = channels[channelName];
        if (hasIntersection(changes, channel.config.parameters)) channel.actual = false;
      }
      if (hasIntersection(changes, report.relations.values())) report.checkRelations = true;
    }
  }
}
