/* --- Action Types --- */

export enum DataSetsActions {
  SET = 'formRefs/set',
}

/* --- Action Interfaces --- */

interface ActionSet {
  type: DataSetsActions.SET,
  formID: FormID,
  value: any,
}

export type DataSetsAction = ActionSet;

/* --- Init State & Reducer --- */

const init: TablesState = {};

export const datasetsReducer = (state: TablesState = init, action: DataSetsAction): TablesState => {
  switch (action.type) {

    case DataSetsActions.SET: {
      return {...state, [action.formID]: action.value};
    }

    default: return state;
  }
};
