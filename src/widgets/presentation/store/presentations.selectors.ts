/** Состояние текущей презентации. */
export const displayedPresentationSelector = (state: WState): PresentationState => {
  const id = state.root.activeChildID;
  return state.presentations[id];
}

/** Список типов всех отображаемых форм (без повторений). */
export const displayedFormTypesSelector = (state: WState): FormType[] => {
  const activePresentationID = state.root.activeChildID;
  const presentation = state.presentations[activePresentationID];
  return presentation ? presentation.childrenTypes : [];
};

/* --- --- --- */

/** Состояние презентации. */
export function presentationStateSelector(this: FormID, state: WState): PresentationState {
  return state.presentations[this];
}

/** ID активного потомка формы; `this - formID`. */
export function activeChildIDSelector(this: FormID, state: WState): FormID {
  return state.presentations[this]?.activeChildID;
}

/** Список программ презентации; `this - formID`. */
export function programsSelector(this: FormID, state: WState): ProgramListData {
  return state.presentations[this]?.programs;
}
