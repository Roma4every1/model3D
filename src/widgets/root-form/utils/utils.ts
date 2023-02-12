/** Снимает выделение со всех элементов в дереве. */
export const clearSelect = (tree: PresentationsTree) => {
  tree.forEach((item) => {
    item.items ? clearSelect(item.items) : item.selected = false;
  });
};

/**
 * Находит в дереве нужный элемент и выделяет его.
 * Делает все вкладки в которых находится элемент раскрытыми.
 * */
export const setActive = (tree: PresentationsTree, activeID: FormID) => {
  for (const item of tree) {
    if (item.items) {
      if (setActive(item.items, activeID)) { item.expanded = true; return; }
    } else if (item.id === activeID) {
      item.selected = true;
      return true;
    }
  }
};
