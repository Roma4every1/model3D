import { RootFormAction, RootFormActionType } from './root-form.reducer';


/** Установить состояние главной формы. */
export function setRootFormState(state: RootFormState): RootFormAction {
  return {type: RootFormActionType.SET, payload: state};
}

/** Выбор презентации из списка. */
export function selectPresentation(id: ClientID): RootFormAction {
  return {type: RootFormActionType.SET_ACTIVE_CHILD_ID, payload: id};
}

/** Установить дерево презентаций. */
export function setPresentationTree(tree: PresentationTree): RootFormAction {
  return {type: RootFormActionType.SET_PRESENTATION_TREE, payload: tree};
}

/** Установить принудительную высоту влкадки в левой панели. */
export function setLeftLayout(layout: LeftPanelLayout): RootFormAction {
  return {type: RootFormActionType.SET_LEFT_LAYOUT, payload: layout};
}
