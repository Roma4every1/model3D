import type { Key } from 'react';
import type { TableColumnModel, TableColumnGroupDict } from './types';


/** Узел в дереве колонок таблицы. */
export interface ColumnTreeNode {
  /** Идентификатор узла; для листьев соответствует ID колонки. */
  key: Key;
  /** Подпись, отображаемая на интерфейсе. */
  title: string;
  /** Идентификатор из `treePath` свойства канала. */
  pathItem?: string;
  /** Список дочерних узлов. */
  children?: ColumnTreeNode[];
}

export class TableColumnTree {
  /** Корневые узлы дерева. */
  public topNodes: ColumnTreeNode[];
  /** Отмеченные узлы дерева. */
  public checkedKeys: Key[];
  /** Раскрытые узлы дерева. */
  public expandedKeys: Key[];

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
