/* --- actions types --- */

export enum ReportsActions {
  SET = 'reports/set',
  CLEAR = 'reports/clear',
}

/* --- actions interfaces --- */

export interface ActionSet {
  type: ReportsActions.SET,
  operationId: any,
  value: any,
}
export interface ActionClear {
  type: ReportsActions.CLEAR,
  presentationId: any,
}

export type ReportsAction = ActionSet | ActionClear;

/* --- reducer --- */

const initReports = [];

export const reportsReducer = (state = initReports, action: ReportsAction) => {
  switch (action.type) {

    case ReportsActions.SET: {
      return {...state, [action.operationId]: action.value};
    }

    case ReportsActions.CLEAR: {
      if (action.presentationId == null) return {};
      return Object.fromEntries(Object.entries(state).filter(e => e[1].ID_PR !== action.presentationId));
    }

    default: return state;
  }
}
