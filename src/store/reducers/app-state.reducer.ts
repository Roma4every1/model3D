/* --- Actions Types --- */

export enum AppStateActions {
  INIT_RESULT = 'app/init',

  FETCH_SESSION_START = 'app/sessionStart',
  FETCH_SESSION_END = 'app/sessionEnd',

  SET_SESSION_ID = 'app/setSessionID',
  CLEAR_SESSION_ID = 'app/clearSession',

  SET_SYSTEM_ID = 'app/setSystemName',
  SET_ROOT_FORM_ID = 'app/setRoot',
}

/* --- Actions Interfaces --- */

interface ActionInitResult {
  type: AppStateActions.INIT_RESULT,
  payload: {config: ClientConfiguration, systemList: SystemList | null},
}

interface ActionFetchSessionStart {
  type: AppStateActions.FETCH_SESSION_START,
}
interface ActionFetchSessionEnd {
  type: AppStateActions.FETCH_SESSION_END,
  payload: Res<SessionID>,
}

interface ActionSetSessionID {
  type: AppStateActions.SET_SESSION_ID,
  payload: SessionID,
}
interface ActionClearSessionID {
  type: AppStateActions.CLEAR_SESSION_ID,
}
interface ActionSetSystemName {
  type: AppStateActions.SET_SYSTEM_ID,
  payload: SystemID,
}
interface ActionSetRootFormID {
  type: AppStateActions.SET_ROOT_FORM_ID,
  payload: FormID,
}

export type AppStateAction = ActionInitResult |
  ActionSetSystemName | ActionSetSessionID | ActionSetRootFormID |
  ActionFetchSessionStart | ActionFetchSessionEnd | ActionClearSessionID;

/* --- Reducer --- */

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
      const { ok, data } = action.payload;
      return ok
        ? {...state, sessionID: {loading: false, success: true, data}}
        : {...state, sessionID: {loading: false, success: false, data: data as string}};
    }

    case AppStateActions.SET_SESSION_ID: {
      return {...state, sessionID: {loading: false, success: true, data: action.payload}};
    }

    case AppStateActions.CLEAR_SESSION_ID: {
      return {...state, sessionID: {loading: false, success: undefined, data: null}};
    }

    case AppStateActions.SET_SYSTEM_ID: {
      return {...state, systemID: action.payload};
    }

    case AppStateActions.SET_ROOT_FORM_ID: {
      return {...state, rootFormID: action.payload};
    }

    default: return state;
  }
}
