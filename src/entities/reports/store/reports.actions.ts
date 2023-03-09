import { ReportsAction, ReportsActions } from './reports.reducer';


/** Создать новые отчёты/программы для презентации. */
export const setReportModels = (clientID: FormID, models: ReportModel[]): ReportsAction => {
  return {type: ReportsActions.CREATE, payload: {clientID, models}};
};

/** Инициализация списка параметров отчёта/программы. */
export const initializeReport = (clientID: FormID, id: ReportID, data: ReportInitData): ReportsAction => {
  return {type: ReportsActions.INITIALIZE, payload: {clientID, id, initData: data}};
}

/** Установить статус операции (если нет - добавить). */
export const setOperationStatus = (operationStatus: OperationStatus): ReportsAction => {
  return {type: ReportsActions.SET_OPERATION_STATUS, payload: operationStatus};
};

/** Установить возможность запуска отчёта/программы. */
export const setCanRunReport = (clientID: FormID, id: ReportID, canRun: boolean): ReportsAction => {
  return {type: ReportsActions.SET_FIELD, payload: {clientID, id, field: 'canRun', value: canRun}};
};

/** Перезаписать каналы запуска отчёта/программы. */
export const setReportChannels = (clientID: FormID, id: ReportID, channels: ChannelDict): ReportsAction => {
  return {type: ReportsActions.SET_FIELD, payload: {clientID, id, field: 'channels', value: channels}};
};

/** Обновить параметр отчёта/программы */
export const updateReportParam = (clientID: FormID, id: ReportID, paramID: ParameterID, value: any): ReportsAction => {
  return {type: ReportsActions.UPDATE_PARAM, payload: {clientID, id, paramID, value}};
};

/** Очистить отчёты/программы для презентации. */
export const clearReports = (clientID: FormID | null): ReportsAction => {
  return {type: ReportsActions.CLEAR_OPERATIONS, payload: clientID};
};
