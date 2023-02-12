import { AppStateAction, AppStateActions } from './app.reducer';


/** Установить клиентскую конфигурацию. */
export const setInitResult = (config: ClientConfiguration, systemList: SystemList | null): AppStateAction => {
  return {type: AppStateActions.INIT_RESULT, payload: {config, systemList}};
};

/** Установить новую систему. */
export const setSystemName = (systemName: SystemID): AppStateAction => {
  return {type: AppStateActions.SET_SYSTEM_ID, payload: systemName};
};

/** Установить новый ID сессии. */
export const setSessionID = (sessionID: SessionID): AppStateAction => {
  return {type: AppStateActions.SET_SESSION_ID, payload: sessionID};
}

/** Очистить хранилище сесиии. */
export const clearSession = (): AppStateAction => {
  return {type: AppStateActions.CLEAR_SESSION_ID};
};
