/** Состояние главной формы. */
export const rootFormStateSelector = (state: WState): RootFormState => {
  return state.root;
};

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
export const presentationTreeSelector = (state: WState): PresentationsTree => {
  return state.root.presentationTree;
};

/** Глобальные параметры. */
export const globalParamsSelector = (state: WState): Parameter[] => {
  return state.parameters[state.root.id];
};

/** Парамерты текущей презентации. */
export const activeChildParamsSelector = (state: WState): Parameter[] => {
  return state.parameters[state.root.activeChildID];
};

/** Список программ/отчётов текущей презентации. */
export const activeChildReportsSelector = (state: WState): ReportInfo[] => {
  return state.presentations[state.root.activeChildID].reports;
};
