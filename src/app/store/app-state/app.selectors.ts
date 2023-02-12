/** Общее состояние приложения. */
export const appStateSelector = (state: WState) => {
  return state.appState;
};

/** Клиентская конфигурация. */
export const configSelector = (state: WState) => {
  return state.appState.config;
};
