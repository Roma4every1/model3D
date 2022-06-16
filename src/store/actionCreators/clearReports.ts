import {ReportsActions, ActionClear} from "../reducers/reports";


const clearReports = (presentationId): ActionClear => {
  return {type: ReportsActions.CLEAR, presentationId: presentationId};
}

export default clearReports;
