import { ReportsAction, ReportActionType } from './reports.reducer';


/** Создать новые отчёты/программы для презентации. */
export function setReportModels(clientID: FormID, models: ReportModel[]): ReportsAction {
  return {type: ReportActionType.SET, payload: {clientID, models}};
}

/** Инициализация списка параметров отчёта/программы. */
export function initializeReport(clientID: FormID, id: ReportID, data: ReportInitData): ReportsAction {
  return {type: ReportActionType.INITIALIZE, payload: {clientID, id, initData: data}};
}

/** Установить статус операции (если нет - добавить). */
export function setOperationStatus(operationStatus: OperationStatus): ReportsAction {
  return {type: ReportActionType.SET_OPERATION_STATUS, payload: operationStatus};
}

/** Установить возможность запуска отчёта/программы. */
export function setCanRunReport(clientID: FormID, id: ReportID, canRun: boolean): ReportsAction {
  return {type: ReportActionType.SET_FIELD, payload: {clientID, id, field: 'canRun', value: canRun}};
}

/** Перезаписать каналы запуска отчёта/программы. */
export function setReportChannels(clientID: FormID, id: ReportID, channels: ChannelDict): ReportsAction {
  return {type: ReportActionType.SET_FIELD, payload: {clientID, id, field: 'channels', value: channels}};
}

/** Обновить параметр отчёта/программы */
export function updateReportParam(clientID: FormID, id: ReportID, paramID: ParameterID, value: any): ReportsAction {
  return {type: ReportActionType.UPDATE_PARAM, payload: {clientID, id, paramID, value}};
}

/** Очистить активные операции для презентации или целиком. */
export function clearOperations(clientID: FormID | null): ReportsAction {
  return {type: ReportActionType.CLEAR_OPERATIONS, payload: clientID};
}
