import type { PresentationTreeNode } from '../lib/presentation-tree';
import { useState } from 'react';
import { useRender } from 'shared/react';
import { Tree, Popover } from 'antd';
import { PresentationTree } from '../lib/presentation-tree';
import './presentation-tree.scss';


export interface PresentationTreeViewProps {
  tree: PresentationTree;
  onSelect: (id: ClientID, popup?: boolean) => void;
}
interface CustomGroupNodeProps {
  tree: PresentationTree;
  node: PresentationTreeNode;
  render: VoidFunction;
}
interface CustomLeafNodeProps {
  tree: PresentationTree;
  node: PresentationTreeNode;
  onSelect: (id: ClientID, popup?: boolean) => void;
}


/** Виджет дерева презентаций. */
export const PresentationTreeView = ({tree, onSelect}: PresentationTreeViewProps) => {
  const render = useRender();
  const { topNodes, expandedKeys, selectedKeys } = tree;

  const onExpand = (keys: number[]) => {
    tree.expandedKeys = keys;
    render();
  };
  const titleRender = (node: PresentationTreeNode) => {
    if (typeof node.key === 'number') {
      return <CustomGroupNode tree={tree} node={node} render={render}/>
    } else {
      return <CustomLeafNode tree={tree} node={node} onSelect={onSelect}/>
    }
  };

  return (
    <Tree
      className={'presentation-tree'} titleRender={titleRender}
      treeData={topNodes} expandedKeys={expandedKeys} selectedKeys={selectedKeys}
      onExpand={onExpand}
    />
  );
};

const CustomLeafNode = ({tree, node, onSelect}: CustomLeafNodeProps) => {
  const key = node.key as ClientID;
  const [open, setOpen] = useState<boolean>();

  const openPopup = () => {
    onSelect(key, true);
    setOpen(false);
    setTimeout(() => setOpen(undefined), 0);
  };
  const onNodeClick = () => {
    if (tree.selectedKeys[0] === key) return;
    tree.selectedKeys = [key];
    onSelect(key);
  };
  const content = <span onClick={openPopup}>Открыть в отдельном окне</span>;

  return (
    <Popover
      rootClassName={'presentation-tree-popover'} content={content}
      trigger={'contextMenu'} placement={'right'} open={open}
    >
      <span onClick={onNodeClick}>{node.title}</span>
    </Popover>
  );
};

const CustomGroupNode = ({tree, node, render}: CustomGroupNodeProps) => {
  const onClick = () => {
    const key = node.key as number;
    tree.expandedKeys = toggleExpanded(tree.expandedKeys, key);
    render();
  };
  return <span onClick={onClick}>{node.title}</span>;
};

function toggleExpanded(keys: number[], key: number): number[] {
  const index = keys.indexOf(key);
  if (index === -1) return [...keys, key];
  return keys.filter(k => k !== key);
}
