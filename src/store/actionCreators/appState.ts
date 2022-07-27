import {AppStateAction, AppStateActions} from "../reducers/appState";


/** Успешная загрузка клиентской конфигурации. */
export const fetchConfigSuccess = (config: ClientConfiguration): AppStateAction => {
  return {type: AppStateActions.FETCH_CONFIG_SUCCESS, payload: config};
}
/** Ошибка при загрузке клиентской конфигурации. */
export const fetchConfigError = (): AppStateAction => {
  return {type: AppStateActions.FETCH_CONFIG_ERROR};
}
/** Установить новую клиентскую конфигурацию. */
export const setConfig = (config: ClientConfiguration): AppStateAction => {
  return {type: AppStateActions.SET_CONFIG, payload: config};
}

/** Успешная загрузка систем. */
export const fetchSystemListSuccess = (systems: SystemList): AppStateAction => {
  return {type: AppStateActions.FETCH_SYSTEM_LIST_SUCCESS, payload: systems};
}
/** Ошибка при загрузке систем. */
export const fetchSystemListError = (): AppStateAction => {
  return {type: AppStateActions.FETCH_SYSTEM_LIST_ERROR};
}
/** Установить новый список ИС. */
export const setSystemList = (systemList: WMWSystem[]): AppStateAction => {
  return {type: AppStateActions.SET_SYSTEM_LIST, payload: systemList};
}

/** Успешный старт сессии. */
export const startSessionSuccess = (sessionID: SessionID): AppStateAction => {
  return {type: AppStateActions.START_SESSION_SUCCESS, payload: sessionID};
}
/** Ошибка при старте сессии. */
export const startSessionError = (): AppStateAction => {
  return {type: AppStateActions.START_SESSION_ERROR};
}
/** Установить новый ID сессии. */
export const setSessionID = (sessionID: SessionID): AppStateAction => {
  return {type: AppStateActions.SET_SESSION_ID, payload: sessionID};
}

export const setSystemName = (systemName: SystemID): AppStateAction => {
  return {type: AppStateActions.SET_SYSTEM_ID, payload: systemName};
}
