import { ReportAction, ReportActionType } from './reports.reducer';


/** Создать новые отчёты/программы для презентации. */
export function setReportModels(clientID: FormID, models: ReportModel[]): ReportAction {
  return {type: ReportActionType.SET, payload: {clientID, models}};
}

/** Инициализация списка параметров отчёта/программы. */
export function initializeReport(
  clientID: FormID, id: ReportID,
  data: ReportInitData,
): ReportAction {
  return {type: ReportActionType.INITIALIZE, payload: {clientID, id, initData: data}};
}

/** Установить возможность запуска отчёта/программы. */
export function setCanRunReport(
  clientID: ClientID, reportID: ReportID,
  canRun: boolean,
): ReportAction {
  return {
    type: ReportActionType.SET_FIELD,
    payload: {clientID, reportID, field: 'canRun', value: canRun}
  };
}

/** Перезаписать каналы запуска отчёта/программы. */
export function setReportChannels(
  clientID: ClientID, reportID: ReportID,
  channels: ChannelDict,
): ReportAction {
  return {
    type: ReportActionType.SET_FIELD,
    payload: {clientID, reportID, field: 'channels', value: channels}
  };
}

/** Обновить параметр отчёта/программы */
export function updateReportParam(
  clientID: ClientID, reportID: ReportID,
  parameterID: ParameterID, value: any,
): ReportAction {
  return {
    type: ReportActionType.UPDATE_PARAMETER,
    payload: {clientID, reportID, parameterID, value}
  };
}

/** Установить статус операции (если нет - добавить). */
export function setOperationStatus(status: Partial<OperationStatus>): ReportAction {
  return {type: ReportActionType.SET_OPERATION_STATUS, payload: status};
}

/** Очистить активные операции для презентации или целиком. */
export function clearOperations(clientID: ClientID | null): ReportAction {
  return {type: ReportActionType.CLEAR_OPERATIONS, payload: clientID};
}
