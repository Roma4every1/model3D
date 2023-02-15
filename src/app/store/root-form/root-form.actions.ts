import { RootFormAction, RootFormActions } from './root-form.reducer';


/** Установить состояние главной формы. */
export const setRootFormState = (state: Omit<RootFormState, 'layout'>): RootFormAction => {
  return {type: RootFormActions.SET, payload: state};
}

/** Выбор презентации из списка. */
export const selectPresentation = (item: PresentationTreeItem): RootFormAction => {
  return {type: RootFormActions.SELECT_PRESENTATION, payload: item};
};

/** Установить принудительную высоту влкадки в левой панели. */
export const setLeftTabHeight = (tab: keyof LeftPanelLayout, height: number): RootFormAction => {
  return {type: RootFormActions.SET_LEFT_TAB_HEIGHT, payload: {tab, height}};
};
