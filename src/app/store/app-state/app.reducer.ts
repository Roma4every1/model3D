/* --- Action Types --- */

export enum AppStateActionType {
  INIT_RESULT = 'app/init',
  SET_SESSION_ID = 'app/session',
  SET_SYSTEM_ID = 'app/systemName',
}

/* --- Action Interfaces --- */

interface ActionInitResult {
  type: AppStateActionType.INIT_RESULT;
  payload: {config: ClientConfiguration, systemList: SystemList | null};
}
interface ActionSetSessionID {
  type: AppStateActionType.SET_SESSION_ID;
  payload: SessionID;
}
interface ActionSetSystemName {
  type: AppStateActionType.SET_SYSTEM_ID;
  payload: SystemID;
}

export type AppStateAction = ActionInitResult | ActionSetSystemName | ActionSetSessionID;

/* --- Init State & Reducer --- */

const init: AppState = {
  config: null,
  systemList: null,
  systemID: null,
  sessionID: null,
  sessionIntervalID: null,
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

    default: return state;
  }
}
