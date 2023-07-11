/** Необходимо ли начать загрузку данных. */
export function stateNeedFetch(state: FetchState | undefined): boolean {
  if (!state) return true;
  return state.ok === undefined && state.loading === false
}

/** Загрузились ли данные. */
export function stateNotLoaded(state: FetchState | undefined): boolean {
  return !state || state.loading;
}
