/* --- Action Types --- */

export enum CanRunReportActions {
  SET = 'canRunReport/set',
}

/* --- Action Interfaces --- */

interface ActionSet {
  type: CanRunReportActions.SET,
  value: CanRunReport,
}

export type CanRunReportAction = ActionSet;

/* --- Init State & Reducer --- */

const init = false;

export const canRunReportReducer = (state: CanRunReport = init, action: CanRunReportAction): CanRunReport => {
  switch (action.type) {

    case CanRunReportActions.SET: {
      return action.value;
    }

    default: return state;
  }
};
