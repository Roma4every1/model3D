/* --- Action Types --- */

export enum ReportsActions {
  SET = 'reports/set',
  CLEAR = 'reports/clear',
}

/* --- Action Interfaces --- */

export interface ActionSet {
  type: ReportsActions.SET,
  operationID: string,
  value: any,
}
export interface ActionClear {
  type: ReportsActions.CLEAR,
  presentationID: string,
}

export type ReportsAction = ActionSet | ActionClear;

/* --- Init State & Reducer --- */

const init: Reports = {};

export const reportsReducer = (state: Reports = init, action: ReportsAction): Reports => {
  switch (action.type) {

    case ReportsActions.SET: {
      return {...state, [action.operationID]: action.value};
    }

    case ReportsActions.CLEAR: {
      const id = action.presentationID;
      if (id == null) return {};
      return Object.fromEntries(Object.entries(state).filter(e => e[1].ID_PR !== id));
    }

    default: return state;
  }
};
