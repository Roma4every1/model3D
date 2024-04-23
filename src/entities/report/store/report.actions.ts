import { useReportStore } from './report.store';


/** Создать новые отчёты/программы для презентации. */
export function setReportModels(id: ClientID, models: ReportModel[]): void {
  const currentModels = useReportStore.getState().models;
  useReportStore.setState({models: {...currentModels, [id]: models}});
}

/** Инициализация списка параметров отчёта/программы. */
export function initializeReport(clientID: FormID, id: ReportID, data: ReportInitData): void {
  const allModels = useReportStore.getState().models;
  const models = allModels[clientID];

  const index = models.findIndex(model => model.id === id);
  if (index === -1) return;

  models[index] = {...models[index], ...data};
  useReportStore.setState({models: {...allModels, [clientID]: [...models]}});
}

/** Установить возможность запуска отчёта/программы. */
export function setCanRunReport(clientID: ClientID, reportID: ReportID, canRun: boolean): void {
  const allModels = useReportStore.getState().models;
  const models = allModels[clientID];

  const index = models.findIndex(model => model.id === reportID);
  if (index === -1) return;

  models[index] = {...models[index], canRun};
  useReportStore.setState({models: {...allModels, [clientID]: [...models]}});
}

/** Перезаписать каналы запуска отчёта/программы. */
export function setReportChannels(clientID: ClientID, reportID: ReportID, channels: ChannelDict): void {
  const allModels = useReportStore.getState().models;
  const models = allModels[clientID];

  const index = models.findIndex(model => model.id === reportID);
  if (index === -1) return;

  models[index] = {...models[index], channels};
  useReportStore.setState({models: {...allModels, [clientID]: [...models]}});
}

/** Обновить параметр отчёта/программы */
export function updateReportParam(clientID: ClientID, id: ReportID, parameterID: ParameterID, value: any): void {
  const state = useReportStore.getState();
  const parameters = state.models[clientID].find(model => model.id === id).parameters;
  const index = parameters.findIndex(p => p.id === parameterID);

  const parameter = parameters[index];
  parameter.setValue(value);
  parameters[index] = parameter.clone();
  useReportStore.setState({...state}, true);
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
