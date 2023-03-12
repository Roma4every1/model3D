import { RootFormAction, RootFormActions } from './root-form.reducer';


/** Установить состояние главной формы. */
export const setRootFormState = (state: RootFormState): RootFormAction => {
  return {type: RootFormActions.SET, payload: state};
}

/** Выбор презентации из списка. */
export const selectPresentation = (item: PresentationTreeItem): RootFormAction => {
  return {type: RootFormActions.SELECT_PRESENTATION, payload: item};
};

/** Установить принудительную высоту влкадки в левой панели. */
export const setLeftLayout = (layout: LeftPanelLayout): RootFormAction => {
  return {type: RootFormActions.SET_LEFT_LAYOUT, payload: layout};
};
