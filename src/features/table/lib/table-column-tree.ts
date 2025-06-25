import type { TableColumnModel, TableColumnGroupDict } from './types';


/** Элемент дерева колонок таблицы. */
export interface ColumnTreeNode {
  /** Идентификатор; для листьев соответствует ID колонки. */
  readonly key: ColumnTreeKey;
  /** Подпись, отображаемая на интерфейсе. */
  readonly title: string;
  /** Идентификатор из `treePath` свойства канала. */
  readonly pathItem?: string;
  /** Список дочерних узлов. */
  readonly children?: ColumnTreeNode[];
}
/** Идентификатор элемента в дереве колонок таблицы. */
export type ColumnTreeKey = PropertyName | number;

export class TableColumnTree {
  /** Корневые узлы дерева. */
  public topNodes: ColumnTreeNode[];
  /** Отмеченные узлы дерева. */
  public checkedKeys: ColumnTreeKey[];
  /** Раскрытые узлы дерева. */
  public expandedKeys: ColumnTreeKey[];

  constructor(columns: TableColumnModel[], groupSettings: TableColumnGroupDict) {
    this.topNodes = [];
    this.checkedKeys = [];
    this.expandedKeys = [];

    let key = 0;
    const rootNode: ColumnTreeNode = {key, title: null, children: this.topNodes};

    for (const column of columns) {
      let node = rootNode;
      const path = column.property.treePath;

      for (const pathItem of path) {
        let nodeItem = node.children.find(i => i.pathItem === pathItem);
        if (nodeItem) { node = nodeItem; continue; }

        const title = groupSettings[pathItem]?.displayName ?? pathItem;
        nodeItem = {key: ++key, title, pathItem, children: []};
        node.children.push(nodeItem);
        node = nodeItem;
      }
      if (column.visible) this.checkedKeys.push(column.id);
      node.children.push({key: column.id, title: column.staticDisplayName});
    }
  }
}
