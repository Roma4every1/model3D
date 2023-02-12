/* --- Action Types --- */

export enum FetchStateActions {
  FETCH_START = 'fetch/start',
  FETCH_END = 'fetch/end',
  FETCH_ERROR = 'fetch/error',
}

/* --- Action Interfaces --- */

interface ActionFetchStart {
  type: FetchStateActions.FETCH_START,
  payload: {type: 'session'} | {type: 'form', ids: FormID[]},
}
interface ActionFetchEnd {
  type: FetchStateActions.FETCH_END,
  payload: {type: 'session'} | {type: 'form', ids: FormID[]},
}
interface ActionFetchError {
  type: FetchStateActions.FETCH_ERROR,
  payload: {type: 'session', error: any} | {type: 'form', formID: FormID, error: any},
}

export type FetchStateAction = ActionFetchStart | ActionFetchEnd | ActionFetchError;

/* --- Init State & Reducer --- */

const init: FetchesState = {
  session: null,
  forms: {},
};

export const fetchStateReducer = (state: FetchesState = init, action: FetchStateAction): FetchesState => {
  switch (action.type) {

    case FetchStateActions.FETCH_START: {
      const stateWait: FetchStateWait = {ok: undefined, loading: true, details: null};
      if (action.payload.type === 'session') {
        return {...state, session: stateWait};
      } else {
        for (const id of action.payload.ids) state.forms[id] = {...stateWait};
        return {...state, forms: {...state.forms}};
      }
    }

    case FetchStateActions.FETCH_END: {
      const stateSuccess: FetchStateSuccess = {ok: true, loading: false, details: null};
      if (action.payload.type === 'session') {
        return {...state, session: stateSuccess};
      } else {
        for (const id of action.payload.ids) state.forms[id] = {...stateSuccess};
        return {...state, forms: {...state.forms}};
      }
    }

    case FetchStateActions.FETCH_ERROR: {
      const stateError: FetchStateError = {ok: false, loading: false, details: action.payload.error};
      if (action.payload.type === 'session') {
        return {...state, session: stateError};
      } else {
        return {...state, forms: {...state.forms, [action.payload.formID]: stateError}};
      }
    }

    default: return state;
  }
};
