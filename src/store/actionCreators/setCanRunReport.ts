import {CanRunReportActions, ActionSet} from "../reducers/canRunReport";


const setCanRunReport = (value: CanRunReport): ActionSet => {
  return {type: CanRunReportActions.SET, value};
}

export default setCanRunReport;
