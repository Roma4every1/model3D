import { MouseEvent, useState } from 'react';
import { Popup } from '@progress/kendo-react-popup';
import { TreeView } from '@progress/kendo-react-treeview';
import { TreeViewExpandChangeEvent, TreeViewCheckChangeEvent } from '@progress/kendo-react-treeview';
import { BigButton } from 'shared/ui';
import { EditPanelItemProps } from '../../lib/types';
import { setTableColumnTree, setTableActiveCell } from '../../store/tables.actions';
import { toggleTreeItemVisibility, findGroupItems } from '../../lib/column-tree-actions';
import columnVisibilityIcon from 'assets/images/dataset/columns-visibility.png';


interface ColumnTreeVisibilityProps {
  tree: ColumnTree,
  setTree: (newTree: ColumnTree) => void,
}


export const ColumnVisibility = ({id, state, dispatch, t}: EditPanelItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);

  const showColumnListClick = (event: MouseEvent) => {
    const target = event.currentTarget;
    if (anchor !== target) setAnchor(target);
    setIsOpen(!isOpen);
  };

  const setTree = (newTree: ColumnTree) => {
    dispatch(setTableColumnTree(id, newTree));
    const activeCell = state.activeCell;
    if (!activeCell.columnID) return;

    const [group, index] = findGroupItems(state.columnTree, activeCell.columnID);
    if (group[index]?.visible === false) {
      dispatch(setTableActiveCell(id, {...activeCell, columnID: null}));
    }
  };

  return (
    <>
      <BigButton
        text={t('table.panel.functions.visibility')} icon={columnVisibilityIcon}
        action={showColumnListClick}
      />
      <Popup className={'dropdown-popup'} id={id} show={isOpen} anchor={anchor}>
        <ColumnTreeVisibility tree={state.columnTree} setTree={setTree}/>
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
