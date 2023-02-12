/** Состояние загрузки сессии. */
export function sessionFetchStateSelector(state: WState): FetchState {
  return state.fetches.session;
}

/** Состояние загрузки формы/презентации. */
export function formFetchStateSelector(this: FormID, state: WState): FetchState {
 return state.fetches.forms[this];
}
