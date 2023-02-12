import { ReportsAction, ReportsActions } from './reports.reducer';


/** Установить репорт. */
export const setReport = (operationID: any, value: any): ReportsAction => {
  return {type: ReportsActions.SET, operationID, value};
};

/** Очистить репорты для презентации. */
export const clearReports = (presentationID: any): ReportsAction => {
  return {type: ReportsActions.CLEAR, presentationID};
};
