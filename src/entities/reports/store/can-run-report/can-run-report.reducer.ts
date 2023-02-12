/* --- Action Types --- */

export enum CanRunReportActions {
  SET = 'canRunReport/set',
}

/* --- Action Interfaces --- */

interface ActionSet {
  type: CanRunReportActions.SET,
  value: boolean,
}

export type CanRunReportAction = ActionSet;

/* --- Reducer --- */

export const canRunReportReducer = (state = false, action: CanRunReportAction): boolean => {
  switch (action.type) {

    case CanRunReportActions.SET: {
      return action.value;
    }

    default: return state;
  }
};
