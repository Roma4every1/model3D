import { GridColumn } from '@progress/kendo-react-grid';
import { HeaderCell } from '../components/cells/custom-cell';


/** По свойствам канала создаёт дерево колонок. */
export function createColumnTree(properties: ChannelProperty[]): ColumnTree {
  const groupTree: ColumnTreeItem = {title: '', children: [], visible: true};

  for (const property of properties) {
    let node = groupTree;
    const treePath = property.treePath;

    for (let i = 0; i < treePath.length; i++) {
      const part = treePath[i].trim();
      if (!node.children) node.children = [];

      let nodeItem = node.children.find(item => item.title === part);
      if (nodeItem) { node = nodeItem; continue; }

      nodeItem = {title: part, visible: true, children: []};
      node.children.push(nodeItem);
      node = nodeItem;
    }
    node.children.push({field: property.name, title: property.displayName, visible: true});
  }
  return groupTree.children;
}

/* --- --- */

/** Возвращает модель колонок таблицы. */
export function getColumnModel(columns: TableColumnsState, tree: ColumnTree) {
  const gridColumns: JSX.Element[] = [];
  tree.forEach((item, i) => {
    if (item.visible === false) return;
    gridColumns.push(getColumnGroup(columns, item, i));
  });
  return gridColumns;
}

function getColumnGroup(columns: TableColumnsState, treeItem: ColumnTreeItem, i: number) {
  const items = treeItem.children;
  const field = treeItem.field;

  if (!items) {
    const { title, width, locked, format } = columns[field];
    return (
      <GridColumn
        key={i} id={field} field={field} format={format} headerCell={HeaderCell}
        title={title} width={width} locked={locked}
      />
    );
  }

  const columnGroupItems: JSX.Element[] = [];
  items.forEach((item, i) => {
    if (item.visible) columnGroupItems.push(getColumnGroup(columns, item, i));
  });

  return (
    <GridColumn key={i} title={treeItem.title} headerCell={HeaderCell}>
      {columnGroupItems}
    </GridColumn>
  );
}

/* --- --- */

/** Возвращает упорядоченный массив ID колонок с учётом их видимости. */
export function getFlatten(tree: ColumnTree): TableColumnID[] {
  const result: TableColumnID[] = [];
  const iterate = (treeItems: ColumnTreeItem[]) => {
    for (const { field, children, visible } of treeItems) {
      if (field && visible) result.push(field);
      if (children) iterate(children);
    }
  }
  iterate(tree);
  return result;
}
