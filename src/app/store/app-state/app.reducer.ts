/* --- Action Types --- */

export enum AppStateActionType {
  INIT_RESULT = 'app/init',
  SET_SESSION_ID = 'app/session',
  SET_SYSTEM_ID = 'app/systemName',
  CLEAR_SESSION_ID = 'app/clear',
}

/* --- Action Interfaces --- */

interface ActionInitResult {
  type: AppStateActionType.INIT_RESULT,
  payload: {config: ClientConfiguration, systemList: SystemList | null},
}
interface ActionSetSessionID {
  type: AppStateActionType.SET_SESSION_ID,
  payload: SessionID,
}
interface ActionClearSessionID {
  type: AppStateActionType.CLEAR_SESSION_ID,
}
interface ActionSetSystemName {
  type: AppStateActionType.SET_SYSTEM_ID,
  payload: SystemID,
}

export type AppStateAction = ActionInitResult | ActionSetSystemName |
  ActionSetSessionID | ActionClearSessionID;

/* --- Init State & Reducer --- */

const init: AppState = {
  config: null,
  systemList: null,
  systemID: null,
  sessionID: null,
};

export function appReducer(state: AppState = init, action: AppStateAction): AppState {
  switch (action.type) {

    case AppStateActionType.INIT_RESULT: {
      const { config, systemList } = action.payload
      return {...state, config, systemList};
    }

    case AppStateActionType.SET_SYSTEM_ID: {
      return {...state, systemID: action.payload};
    }

    case AppStateActionType.SET_SESSION_ID: {
      return {...state, sessionID: action.payload};
    }

    case AppStateActionType.CLEAR_SESSION_ID: {
      return {...state, sessionID: null};
    }

    default: return state;
  }
}
