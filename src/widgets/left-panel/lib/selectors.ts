/** Глобальные параметры. */
export const globalParamsSelector = (state: WState): Parameter[] => {
  return state.parameters[state.root.id];
};

/** Парамерты текущей презентации. */
export const presentationParamsSelector = (state: WState): Parameter[] => {
  return state.parameters[state.root.activeChildID];
};
