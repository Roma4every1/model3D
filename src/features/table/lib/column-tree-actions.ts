import { GridColumnProps } from '@progress/kendo-react-grid';
import { stringToTableCell } from 'entities/parameters/lib/table-row';


/** По состоянию колонок из события `onColumnResize` применяет новые значения ширины. */
export function applyColumnsWidth(columnsState: TableColumnsState, newColumns: GridColumnProps[]) {
  for (const column of newColumns) {
    if (column.children?.length) {
      applyColumnsWidth(columnsState, column.children as GridColumnProps[]);
    } else {
      const columnState = columnsState[column.id];
      if (columnState.width !== column.width) {
        columnState.width = Math.round(column.width as number);
        columnState.autoWidth = false;
      }
    }
  }
}

/* --- --- */

export function applyColumnsHeaders(tree: ColumnTree, rules: HeaderSetterRule[], params: Parameter[]) {
  const values = params.map((param, i) => {
    if (!param?.value) return undefined;
    return stringToTableCell(param.value as string, rules[i].column);
  });
  applyRules(tree, rules, values);
}

function applyRules(items: ColumnTreeItem[], rules: HeaderSetterRule[], values: string[]) {
  for (const item of items) {
    if (item.children) {
      applyRules(item.children, rules, values);
    } else {
      const field = item.field;
      rules.forEach((rule, i) => {
        if (rule.property !== field) return;
        item.paramTitle = values[i];
      });
    }
  }
}

/* --- --- */

/** Перемещает колонку в рамках группы.
 * + `left` — влево
 * + `right` — вправо
 * + `start` — в начало **группы**
 * + `end` — в конец **группы**
 * */
export function moveColumn(items: ColumnTreeItem[], index: number, to: string) {
  let targetIndex: number;
  const notFirst = index > 0;
  const notLast = index < items.length - 1;

  if (to === 'left' && notFirst) {
    targetIndex = index - 1;
    while (items[targetIndex] && !items[targetIndex].visible) targetIndex--;
  } else if (to === 'right' && notLast) {
    targetIndex = index + 1;
    while (items[targetIndex] && !items[targetIndex].visible) targetIndex++;
  } else if (to === 'start' && notFirst) {
    targetIndex = 0;
  } else if (to === 'end' && notLast) {
    targetIndex = items.length;
  }

  if (targetIndex !== undefined) {
    const [item] = items.splice(index, 1);
    items.splice(targetIndex, 0, item);
  }
}

export function findGroupItems(tree: ColumnTree, columnID: TableColumnID): [ColumnTree, number] {
  for (let i = 0; i < tree.length; i++) {
    const treeItem = tree[i];
    if (treeItem.field === columnID) return [tree, i];
    if (!treeItem.children) continue;

    const result = findGroupItems(treeItem.children, columnID);
    if (result[0]) return result;
  }
  return [[], -1];
}

/* --- --- */

/**
 * Обновляет состояние видимости колонок:
 * 1. устанавливает такую же видимость для всех дочерних узлов
 * 2. если колонка видима, устанавливает видимость для родительских узлов
 * */
export function toggleTreeItemVisibility(tree: ColumnTree, item: ColumnTreeItem) {
  const visible = !item.visible;
  setChildrenVisible(item, visible);
  setParentsVisible(tree, item, visible);
}

function setChildrenVisible(item: ColumnTreeItem, visible: boolean) {
  item.visible = visible;
  const items: ColumnTreeItem[] = item.children;
  if (items) items.forEach((i) => setChildrenVisible(i, visible));
}

function setParentsVisible(tree: ColumnTree, targetItem: ColumnTreeItem, visible: boolean) {
  for (const item of tree) {
    const items = item.children;
    if (items && setParentsVisible(items, targetItem, visible)) {
      item.visible = !items.every(i => !i.visible);
      return true;
    }
    if (item === targetItem) {
      item.visible = visible;
      return true;
    }
  }
  return false;
}
