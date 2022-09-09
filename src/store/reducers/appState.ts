/* --- actions types --- */

export enum AppStateActions {
  FETCH_CONFIG_SUCCESS = 'app/fetchConfigSuccess',
  FETCH_CONFIG_ERROR = 'app/fetchConfigError',
  SET_CONFIG = 'app/setClientConfig',

  FETCH_SYSTEM_LIST_SUCCESS = 'app/fetchSystemsSuccess',
  FETCH_SYSTEM_LIST_ERROR = 'app/fetchSystemsError',

  START_SESSION_SUCCESS = 'app/startSessionSuccess',
  START_SESSION_ERROR = 'app/startSessionError',
  SET_SESSION_ID = 'app/setSessionID',

  SET_SYSTEM_ID = 'app/setSystemName',
}

/* --- actions interfaces --- */

interface ActionFetchConfigSuccess {
  type: AppStateActions.FETCH_CONFIG_SUCCESS,
  payload: ClientConfiguration,
}
interface ActionFetchConfigError {
  type: AppStateActions.FETCH_CONFIG_ERROR,
}
interface ActionSetConfig {
  type: AppStateActions.SET_CONFIG,
  payload: ClientConfiguration,
}
interface ActionFetchSystemListSuccess {
  type: AppStateActions.FETCH_SYSTEM_LIST_SUCCESS,
  payload: SystemList,
}
interface ActionFetchSystemListError {
  type: AppStateActions.FETCH_SYSTEM_LIST_ERROR,
}
interface ActionStartSessionSuccess {
  type: AppStateActions.START_SESSION_SUCCESS,
  payload: SessionID,
}
interface ActionStartSessionError {
  type: AppStateActions.START_SESSION_ERROR,
}
interface ActionSetSessionID {
  type: AppStateActions.SET_SESSION_ID,
  payload: SessionID,
}
interface ActionSetSystemName {
  type: AppStateActions.SET_SYSTEM_ID,
  payload: SystemID,
}

export type AppStateAction =
  ActionFetchConfigSuccess | ActionFetchConfigError | ActionSetConfig |
  ActionFetchSystemListSuccess | ActionFetchSystemListError | ActionSetSystemName |
  ActionStartSessionSuccess | ActionStartSessionError | ActionSetSessionID;

/* --- reducer --- */

const initAppState: AppState = {
  config: {loaded: false, success: undefined, data: null},
  systemList: {loaded: false, success: undefined, data: null},
  sessionID: {loaded: false, success: undefined, data: null},
  systemID: null,
};

export const appStateReducer = (state: AppState = initAppState, action: AppStateAction): AppState => {
  switch (action.type) {

    case AppStateActions.FETCH_CONFIG_SUCCESS: {
      return {...state, config: {loaded: true, success: true, data: action.payload}};
    }

    case AppStateActions.FETCH_CONFIG_ERROR: {
      return {...state, config: {loaded: true, success: false, data: null}};
    }

    case AppStateActions.SET_CONFIG: {
      return {...state, config: {...state.config, data: action.payload}};
    }

    case AppStateActions.FETCH_SYSTEM_LIST_SUCCESS: {
      return {...state, systemList: {loaded: true, success: true, data: action.payload}};
    }

    case AppStateActions.FETCH_SYSTEM_LIST_ERROR: {
      return {...state, systemList: {loaded: true, success: false, data: null}};
    }

    case AppStateActions.START_SESSION_SUCCESS: {
      return {...state, sessionID: {loaded: true, success: true, data: action.payload}};
    }

    case AppStateActions.START_SESSION_ERROR: {
      return {...state, sessionID: {loaded: true, success: false, data: null}};
    }

    case AppStateActions.SET_SESSION_ID: {
      return {...state, sessionID: {...state.sessionID, data: action.payload}};
    }

    case AppStateActions.SET_SYSTEM_ID: {
      return {...state, systemID: action.payload};
    }

    default: return state;
  }
}
