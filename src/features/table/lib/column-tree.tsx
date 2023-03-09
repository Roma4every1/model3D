import { GridColumn } from '@progress/kendo-react-grid';
import { HeaderCell, GroupHeaderCell } from '../components/cells/header';


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
export function getColumnModel(
  columns: TableColumnsState, tree: ColumnTree,
  channelName: ChannelName, query: ChannelQuerySettings
) {
  const gridColumns: JSX.Element[] = [];
  tree.forEach((item, i) => {
    if (item.visible === false) return;
    gridColumns.push(getColumnGroup(columns, item, i, channelName, query));
  });
  return gridColumns;
}

function getColumnGroup(
  columns: TableColumnsState, treeItem: ColumnTreeItem, i: number,
  channelName: ChannelName, query: ChannelQuerySettings,
) {
  const items = treeItem.children;
  const field = treeItem.field;

  if (!items) {
    const { title, width, locked, format, colName } = columns[field];
    const headerCellThis = {channelName, query, channelColumn: colName};
    return (
      <GridColumn
        key={i} id={field} field={field} format={format} headerCell={HeaderCell.bind(headerCellThis)}
        title={treeItem.paramTitle ?? title} width={width} locked={locked}
      />
    );
  }

  const columnGroupItems: JSX.Element[] = [];
  items.forEach((item, i) => {
    if (item.visible) columnGroupItems.push(getColumnGroup(columns, item, i, channelName, query));
  });

  return (
    <GridColumn key={i} title={treeItem.title} headerCell={GroupHeaderCell}>
      {columnGroupItems}
    </GridColumn>
  );
}

/* --- --- */

/** Вызывает указанную функцию для каждого листа дерева колонок. */
export function forEachLeaf(tree: ColumnTree, fn: (item: ColumnTreeItem, i?: number) => void) {
  let i = 0;
  const iterate = (treeItems: ColumnTreeItem[]) => {
    for (const item of treeItems) {
      if (item.children) {
        iterate(item.children)
      } else {
        fn(item, i); i++;
      }
    }
  };
  iterate(tree);
}

/** Возвращает упорядоченный массив ID колонок с учётом их видимости. */
export function getFlatten(tree: ColumnTree): TableColumnID[] {
  const result: TableColumnID[] = [];
  forEachLeaf(tree, (item) => { result.push(item.field); });
  return result;
}
