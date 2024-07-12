import { MouseEvent, useState, useRef } from 'react';
import { Popup } from '@progress/kendo-react-popup';
import { TreeView } from '@progress/kendo-react-treeview';
import { TreeViewExpandChangeEvent, TreeViewCheckChangeEvent } from '@progress/kendo-react-treeview';
import { BigButton } from 'shared/ui';
import { EditPanelItemProps } from '../../lib/types';
import { setTableColumnTree, setTableActiveCell } from '../../store/table.actions';
import { toggleTreeItemVisibility, findGroupItems } from '../../lib/column-tree-actions';
import columnVisibilityIcon from 'assets/table/columns-visibility.png';


interface ColumnTreeVisibilityProps {
  tree: ColumnTree;
  setTree: (newTree: ColumnTree) => void;
  focusRef: {current: FocusRef};
}
interface FocusRef {
  button: boolean;
  popup: boolean;
  check(): void;
}


export const ColumnVisibility = ({id, state, t}: EditPanelItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);

  const focusRef = useRef<FocusRef>({
    button: false, popup: false,
    check() {
      // если после всех изменений (след. тик) оба элемента потеряли фокус, закрыть
      const timeout = () => { if (!this.button && !this.popup) setIsOpen(false); };
      setTimeout(timeout, 0);
    },
  });

  const onClick = (event: MouseEvent) => {
    const target = event.currentTarget;
    if (anchor !== target) setAnchor(target);
    setIsOpen(!isOpen);
  };

  const setTree = (newTree: ColumnTree) => {
    setTableColumnTree(id, newTree);
    const activeCell = state.activeCell;
    if (!activeCell.columnID) return;

    const [group, index] = findGroupItems(state.columnTree, activeCell.columnID);
    if (group[index]?.visible === false) {
      setTableActiveCell(id, {...activeCell, columnID: null});
    }
  };

  const onBlur = () => {
    focusRef.current.button = false;
    focusRef.current.check();
  };
  const onFocus = () => {
    focusRef.current.button = true;
  };

  return (
    <div onBlur={onBlur} onFocus={onFocus}>
      <BigButton
        text={t('table.panel.functions.visibility')} icon={columnVisibilityIcon}
        action={onClick}
      />
      <Popup className={'dropdown-popup'} id={id} show={isOpen} anchor={anchor}>
        <ColumnTreeVisibility tree={state.columnTree} setTree={setTree} focusRef={focusRef}/>
      </Popup>
    </div>
  );
};

const ColumnTreeVisibility = ({tree, focusRef, setTree}: ColumnTreeVisibilityProps) => {
  const onExpandChange = (event: TreeViewExpandChangeEvent) => {
    event.item.expanded = !event.item.expanded;
    setTree(tree);
  };
  const onCheckChange = (event: TreeViewCheckChangeEvent) => {
    toggleTreeItemVisibility(tree, event.item);
    setTree([...tree]);
  };

  const onFocus = () => {
    focusRef.current.popup = true;
  };
  const onBlur = () => {
    focusRef.current.popup = false;
    focusRef.current.check();
  };

  return (
    <div onFocus={onFocus} onBlur={onBlur}>
      <TreeView
        data={tree} childrenField={'children'} textField={'title'}
        expandIcons={true} expandField={'expanded'} onExpandChange={onExpandChange}
        checkboxes={true} checkField={'visible'} onCheckChange={onCheckChange}
      />
    </div>
  );
};
