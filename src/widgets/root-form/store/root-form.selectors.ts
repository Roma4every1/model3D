/** Состояние главной формы. */
export const rootFormStateSelector = (state: WState): RootFormState => {
  return state.root;
};

/** ID главной формы. */
export const rootFormIDSelector = (state: WState): FormID => {
  return state.root.id;
}

/** ID активной презентации. */
export const rootActiveChildIDSelector = (state: WState): FormID => {
  return state.root.activeChildID;
};

/** Прототип разметки левой панели. */
export const leftLayoutSelector = (state: WState): LeftPanelLayout => {
  return state.root.layout.left;
};

/** Прототип разметки главной формы. */
export const dockLayoutSelector = (state: WState): CommonLayout => {
  return state.root.layout.common;
};

/** Дерево презентаций. */
export const presentationsTreeSelector = (state: WState): PresentationsTree => {
  return state.root.presentationsTree;
};

/** Настройки плагина `dateChanging`. */
export const dateChangingSelector = (state: WState): DateChangingPlugin => {
  return state.root.settings.dateChanging;
};
