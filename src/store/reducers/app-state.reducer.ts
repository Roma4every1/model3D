/* --- Action Types --- */

export enum AppStateActions {
  INIT_RESULT = 'app/init',
  FETCH_SESSION_START = 'app/sessionStart',
  FETCH_SESSION_END = 'app/sessionEnd',
  SET_SYSTEM_ID = 'app/systemName',
  CLEAR_SESSION_ID = 'app/clear',
}

/* --- Action Interfaces --- */

interface ActionInitResult {
  type: AppStateActions.INIT_RESULT,
  payload: {config: ClientConfiguration, systemList: SystemList | null},
}
interface ActionFetchSessionStart {
  type: AppStateActions.FETCH_SESSION_START,
}
interface ActionFetchSessionEnd {
  type: AppStateActions.FETCH_SESSION_END,
  payload: {ok: boolean, data: string, rootFormID?: string},
}
interface ActionClearSessionID {
  type: AppStateActions.CLEAR_SESSION_ID,
}
interface ActionSetSystemName {
  type: AppStateActions.SET_SYSTEM_ID,
  payload: SystemID,
}

export type AppStateAction = ActionInitResult | ActionSetSystemName |
  ActionFetchSessionStart | ActionFetchSessionEnd | ActionClearSessionID;

/* --- Init State & Reducer --- */

const init: AppState = {
  config: null,
  systemList: null,
  rootFormID: null,
  systemID: null,
  sessionID: {loading: false, success: undefined, data: null},
};

export const appStateReducer = (state: AppState = init, action: AppStateAction): AppState => {
  switch (action.type) {

    case AppStateActions.INIT_RESULT: {
      const { config, systemList } = action.payload
      return {...state, config, systemList};
    }

    case AppStateActions.FETCH_SESSION_START: {
      return {...state, sessionID: {loading: true, success: undefined, data: null}};
    }

    case AppStateActions.FETCH_SESSION_END: {
      const { ok, data, rootFormID } = action.payload;
      if (ok) {
        const sessionState: FetchState<SessionID> = {loading: false, success: true, data};
        return {...state, sessionID: sessionState, rootFormID};
      } else {
        return {...state, sessionID: {loading: false, success: false, data}};
      }
    }

    case AppStateActions.CLEAR_SESSION_ID: {
      return {...state, sessionID: {loading: false, success: undefined, data: null}};
    }

    case AppStateActions.SET_SYSTEM_ID: {
      return {...state, systemID: action.payload};
    }

    default: return state;
  }
};
