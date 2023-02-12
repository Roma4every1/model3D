/* --- Action Types --- */

export enum AppStateActions {
  INIT_RESULT = 'app/init',
  SET_SESSION_ID = 'app/session',
  SET_SYSTEM_ID = 'app/systemName',
  CLEAR_SESSION_ID = 'app/clear',
}

/* --- Action Interfaces --- */

interface ActionInitResult {
  type: AppStateActions.INIT_RESULT,
  payload: {config: ClientConfiguration, systemList: SystemList | null},
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

export type AppStateAction = ActionInitResult | ActionSetSystemName |
  ActionSetSessionID | ActionClearSessionID;

/* --- Init State & Reducer --- */

const init: AppState = {
  config: null,
  systemList: null,
  systemID: null,
  sessionID: null,
};

export const appReducer = (state: AppState = init, action: AppStateAction): AppState => {
  switch (action.type) {

    case AppStateActions.INIT_RESULT: {
      const { config, systemList } = action.payload
      return {...state, config, systemList};
    }

    case AppStateActions.SET_SYSTEM_ID: {
      return {...state, systemID: action.payload};
    }

    case AppStateActions.SET_SESSION_ID: {
      return {...state, sessionID: action.payload};
    }

    case AppStateActions.CLEAR_SESSION_ID: {
      return {...state, sessionID: null};
    }

    default: return state;
  }
};
