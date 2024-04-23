import { useRootStore } from './root-form.store';


/** Установить состояние главной формы. */
export function setRootFormState(state: RootFormState): void {
  setActive(state.settings.presentationTree, state.activeChildID);
  useRootStore.setState(state, true);
}

/** Выбор презентации из списка. */
export function selectPresentation(id: ClientID): void {
  useRootStore.setState({activeChildID: id});
}

/** Установить дерево презентаций. */
export function setPresentationTree(tree: PresentationTree): void {
  const current = useRootStore.getState().settings;
  useRootStore.setState({settings: {...current, presentationTree: tree}});
}

/** Установить принудительную высоту влкадки в левой панели. */
export function setLeftLayout(layout: LeftPanelLayout): void {
  const current = useRootStore.getState().layout;
  useRootStore.setState({layout: {...current, left: layout}});
}

/* --- Utils --- */

/**
 * Находит в дереве нужный элемент и выделяет его.
 * Делает все вкладки в которых находится элемент раскрытыми.
 * */
function setActive(tree: PresentationTree, activeID: FormID) {
  for (const item of tree) {
    if (item.items) {
      if (setActive(item.items, activeID)) { item.expanded = true; return; }
    } else if (item.id === activeID) {
      item.selected = true;
      return true;
    }
  }
}
