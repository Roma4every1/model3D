/* --- Actions Types --- */

export enum AppStateActions {
  FETCH_CONFIG_START = 'app/configStart',
  FETCH_CONFIG_END = 'app/configEnd',

  FETCH_SYSTEM_LIST_START = 'app/systemsStart',
  FETCH_SYSTEM_LIST_END = 'app/systemsEnd',

  FETCH_SESSION_START = 'app/sessionStart',
  FETCH_SESSION_END = 'app/sessionEnd',

  SET_SESSION_ID = 'app/setSessionID',
  CLEAR_SESSION_ID = 'app/clearSession',

  SET_SYSTEM_ID = 'app/setSystemName',
  SET_ROOT_FORM_ID = 'app/setRoot',
}

/* --- Actions Interfaces --- */

interface ActionFetchConfigStart {
  type: AppStateActions.FETCH_CONFIG_START,
}
interface ActionFetchConfigEnd {
  type: AppStateActions.FETCH_CONFIG_END,
  payload: Res<ClientConfiguration>,
}

interface ActionFetchSystemListStart {
  type: AppStateActions.FETCH_SYSTEM_LIST_START,
}
interface ActionFetchSystemListEnd {
  type: AppStateActions.FETCH_SYSTEM_LIST_END,
  payload: Res<SystemList>
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

export type AppStateAction = ActionSetSystemName | ActionSetSessionID |
  ActionFetchConfigStart | ActionFetchConfigEnd | ActionSetRootFormID |
  ActionFetchSystemListStart | ActionFetchSystemListEnd |
  ActionFetchSessionStart | ActionFetchSessionEnd | ActionClearSessionID;

/* --- Reducer --- */

const init: AppState = {
  config: {loading: false, success: undefined, data: null},
  systemList: {loading: false, success: undefined, data: null},
  sessionID: {loading: false, success: undefined, data: null},
  rootFormID: null,
  systemID: null,
};

export const appStateReducer = (state: AppState = init, action: AppStateAction): AppState => {
  switch (action.type) {

    case AppStateActions.FETCH_CONFIG_START: {
      return {...state, config: {loading: true, success: undefined, data: null}};
    }

    case AppStateActions.FETCH_CONFIG_END: {
      const { ok, data } = action.payload;
      return ok
        ? {...state, config: {loading: false, success: true, data}}
        : {...state, config: {loading: false, success: false, data: data as string}};
    }

    case AppStateActions.FETCH_SYSTEM_LIST_START: {
      return {...state, systemList: {loading: true, success: undefined, data: null}};
    }

    case AppStateActions.FETCH_SYSTEM_LIST_END: {
      const { ok, data } = action.payload;
      return ok
        ? {...state, systemList: {loading: false, success: true, data}}
        : {...state, systemList: {loading: false, success: false, data: data as string}};
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
