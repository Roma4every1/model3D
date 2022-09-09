/* --- actions types --- */

export enum CanRunReportActions {
  SET = 'canRunReport/set',
}

/* --- actions interfaces --- */

interface ActionSet {
  type: CanRunReportActions.SET,
  value: CanRunReport,
}

export type CanRunReportAction = ActionSet;

/* --- reducer --- */

const initCanRunReport = false;

export const canRunReportReducer = (state: CanRunReport = initCanRunReport, action: CanRunReportAction): CanRunReport => {
  switch (action.type) {

    case CanRunReportActions.SET: {
      return action.value;
    }

    default: return state;
  }
}
