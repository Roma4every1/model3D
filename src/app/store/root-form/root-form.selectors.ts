/** Состояние главной формы. */
export const rootStateSelector = (state: WState): RootFormState => {
  return state.root;
};

/** Состояние текущей презентации. */
export const presentationSelector = (state: WState): PresentationState => {
  const id = state.root.activeChildID;
  return state.presentations[id];
}
