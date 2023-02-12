import { CanRunReportAction, CanRunReportActions } from './can-run-report.reducer';


export const setCanRunReport = (value: boolean): CanRunReportAction => {
  return {type: CanRunReportActions.SET, value};
};
