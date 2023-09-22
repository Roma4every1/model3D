/** Состояние главной формы. */
export const rootStateSelector = (state: WState): RootFormState => {
  return state.root;
};

/** Состояние текущей презентации. */
export const presentationSelector = (state: WState): PresentationState => {
  const id = state.root.activeChildID;
  return state.presentations[id];
}

/** Нужно ли показывать правую панель с трассами. */
export function needTraceRightTabSelector(state: WState): boolean {
  return state.objects.trace.editing === true;
}
