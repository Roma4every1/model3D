import { AppStateAction, AppStateActionType } from './app.reducer';


/** Установить клиентскую конфигурацию. */
export function setInitResult(config: ClientConfiguration, systemList: SystemList | null): AppStateAction {
  return {type: AppStateActionType.INIT_RESULT, payload: {config, systemList}};
}

/** Установить новую систему. */
export function setSystemName(systemName: SystemID): AppStateAction {
  return {type: AppStateActionType.SET_SYSTEM_ID, payload: systemName};
}

/** Установить новый ID сессии. */
export function setSessionID(sessionID: SessionID): AppStateAction {
  return {type: AppStateActionType.SET_SESSION_ID, payload: sessionID};
}
