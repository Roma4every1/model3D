import { TFunction } from 'react-i18next';
import { MouseEvent, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Popup } from '@progress/kendo-react-popup';
import { TreeView } from '@progress/kendo-react-treeview';
import { TreeViewExpandChangeEvent, TreeViewCheckChangeEvent } from '@progress/kendo-react-treeview';
import { BigButton } from 'shared/ui';
import { setTableColumnTree } from '../../store/tables.actions';
import { toggleTreeItemVisibility } from '../../lib/column-tree-actions';
import columnVisibilityIcon from 'assets/images/dataset/columns-visibility.png';


interface ColumnVisibilityProps {
  id: FormID,
  tree: ColumnTree,
  t: TFunction,
}
interface ColumnTreeVisibilityProps {
  tree: ColumnTree,
  setTree: (newTree: ColumnTree) => void,
}


export const ColumnVisibility = ({id, tree, t}: ColumnVisibilityProps) => {
  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);

  const showColumnListClick = (event: MouseEvent) => {
    const target = event.currentTarget;
    if (anchor !== target) setAnchor(target);
    setIsOpen(!isOpen);
  };

  const setTree = (newTree: ColumnTree) => {
    dispatch(setTableColumnTree(id, newTree));
  };

  return (
    <>
      <BigButton
        text={t('table.panel.functions.visibility')} icon={columnVisibilityIcon}
        action={showColumnListClick}
      />
      <Popup className={'dropdown-popup'} id={id} show={isOpen} anchor={anchor}>
        <ColumnTreeVisibility tree={tree} setTree={setTree}/>
      </Popup>
    </>
  );
};

const ColumnTreeVisibility = ({tree, setTree}: ColumnTreeVisibilityProps) => {
  const onExpandChange = (event: TreeViewExpandChangeEvent) => {
    event.item.expanded = !event.item.expanded;
    setTree(tree);
  };
  const onCheckChange = (event: TreeViewCheckChangeEvent) => {
    toggleTreeItemVisibility(tree, event.item);
    setTree([...tree]);
  };

  return (
    <TreeView
      data={tree} childrenField={'children'} textField={'title'}
      expandIcons={true} expandField={'expanded'} onExpandChange={onExpandChange}
      checkboxes={true} checkField={'visible'} onCheckChange={onCheckChange}
    />
  );
};
