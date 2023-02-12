import { FetchStateAction, FetchStateActions } from './fetch-state.reducer';


/** Начало загрузки новой сессии. */
export const fetchSessionStart = (): FetchStateAction => {
  return {type: FetchStateActions.FETCH_START, payload: {type: 'session'}};
};

/** Конец загрузки новой сессии. */
export const fetchSessionEnd = (): FetchStateAction => {
  return {type: FetchStateActions.FETCH_END, payload: {type: 'session'}};
};

/** Ошибка при загрузке новой сессии. */
export const fetchSessionError = (error: any): FetchStateAction => {
  return {type: FetchStateActions.FETCH_ERROR, payload: {type: 'session', error}};
};


/** Начало загрузки новой формы/презентации. */
export const fetchFormsStart = (ids: FormID[]): FetchStateAction => {
  return {type: FetchStateActions.FETCH_START, payload: {type: 'form', ids}};
};

/** Конец загрузки новой формы/презентации. */
export const fetchFormsEnd = (ids: FormID[]): FetchStateAction => {
  return {type: FetchStateActions.FETCH_END, payload: {type: 'form', ids}};
};

/** Ошибка при загрузке новой формы/презентации. */
export const fetchFormError = (formID: FormID, error: any): FetchStateAction => {
  return {type: FetchStateActions.FETCH_ERROR, payload: {type: 'form', formID, error}};
};
