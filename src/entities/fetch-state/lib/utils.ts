/** Необходимо ли начать загрузку данных. */
export const stateNeedFetch = (state: FetchState | undefined): boolean => {
  if (!state) return true;
  return state.ok === undefined && state.loading === false
};

/** Загрузились ли данные. */
export const stateNotLoaded = (state: FetchState | undefined): boolean => {
  return !state || state.loading;
};
