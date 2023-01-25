/* --- Action Types --- */

export enum ProgramsActions {
  ADD = 'programs/add',
  FETCH_START = 'programs/start',
  FETCH_END = 'programs/end',
}

/* --- Action Interfaces --- */

interface ActionAdd {
  type: ProgramsActions.ADD,
  formID: FormID,
}
interface ActionFetchStart {
  type: ProgramsActions.FETCH_START,
  formID: FormID,
}
interface ActionFetchEndSuccess {
  type: ProgramsActions.FETCH_END,
  formID: FormID,
  data: ProgramListData,
}
interface ActionFetchEndError {
  type: ProgramsActions.FETCH_END,
  formID: FormID,
  data: string,
}

export type ProgramsAction = ActionAdd | ActionFetchStart | ActionFetchEndSuccess | ActionFetchEndError;

/* --- Init State & Reducer --- */

const init: ProgramsState = {};

export const programsReducer = (state: ProgramsState = init, action: ProgramsAction): ProgramsState => {
  switch (action.type) {

    case ProgramsActions.ADD: {
      return {...state, [action.formID]: {loading: false, success: undefined, data: null}};
    }

    case ProgramsActions.FETCH_START: {
      return {...state, [action.formID]: {loading: true, success: undefined, data: null}};
    }

    case ProgramsActions.FETCH_END: {
      const { data, formID } = action;
      if (typeof data === 'string') {
        return {...state, [formID]: {loading: false, success: false, data}}
      } else {
        return {...state, [formID]: {loading: false, success: true, data}};
      }
    }

    default: return state;
  }
};
