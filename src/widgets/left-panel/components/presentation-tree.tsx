import type { TreeViewExpandChangeEvent, TreeViewItemClickEvent } from '@progress/kendo-react-treeview';
import { useMemo } from 'react';
import { TreeView } from '@progress/kendo-react-treeview';
import { forEachTreeLeaf, findInTree } from 'shared/lib';


interface PresentationTreeProps {
  tree: PresentationTree;
  onSelect: (id: ClientID) => void | Promise<void>;
}


export const PresentationTreeView = ({tree, onSelect}: PresentationTreeProps) => {
  const visibleNodes = useMemo(() => {
    return getVisibleNodes(tree);
  }, [tree]);

  const onExpandChange = ({item}: TreeViewExpandChangeEvent) => {
    const id = item.id;
    const treeItem = findInTree(tree, i => i.id === id, 'items');
    const newExpanded = !item.expanded;
    item.expanded = newExpanded;
    treeItem.expanded = newExpanded;
  };

  const onItemClick = (event: TreeViewItemClickEvent) => {
    const { id, items } = event.item;
    if (items) return onExpandChange(event);
    const callback = (i: PresentationTreeItem) => { i.selected = i.id === id; };
    forEachTreeLeaf(tree, callback, 'items');
    forEachTreeLeaf(visibleNodes, callback, 'items');
    onSelect(id);
  };

  return (
    <TreeView
      className={'presentation-tree'} data={visibleNodes}
      expandIcons={true} aria-multiselectable={false}
      onExpandChange={onExpandChange} onItemClick={onItemClick}
    />
  );
};

function getVisibleNodes(tree: PresentationTree): PresentationTree {
  return tree.map((item: PresentationTreeItem): PresentationTreeItem => {
    let items = item.items;
    if (!items) return {...item};
    items = getVisibleNodes(items);
    return {...item, items, visible: !items.every(i => i.visible === false)};
  }).filter(item => item.visible !== false);
}
