import {ActionSet, ReportsActions} from "../reducers/reports";


const setReport = (operationId, value): ActionSet => {
  return {type: ReportsActions.SET, operationId, value};
}

export default setReport;
