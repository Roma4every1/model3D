import type { KeyboardEvent } from 'react';
import type { CellEditorProps, TableActions } from '../../lib/types';
import { useState, useMemo } from 'react';
import { Select, TreeSelect } from 'antd';


/** Редактор ячейки с выборочным значением из списка. */
export const EditCellList = ({state, record, column, update}: CellEditorProps) => {
  const data = column.lookupData as LookupListItem[];
  const [open, setOpen] = useState(false);
  const [innerValue, setInnerValue] = useState(record.cells[column.columnIndex]);

  const options = useMemo(() => {
    return data.map(d => ({value: d.id, label: d.value}));
  }, [data]);

  const onChange = (value: any) => {
    update(value); setInnerValue(value);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    handleKeyDown(e, open, state.actions);
  };

  return (
    <Select
      variant={'borderless'} options={options} value={innerValue}
      showSearch={true} filterOption={filterOption}
      onChange={onChange} onKeyDown={onKeyDown} onDropdownVisibleChange={setOpen}
      popupClassName={'cell-editor-popup'} virtual={false}
    />
  );
};

/** Редактор ячейки с выборочным значением из дерева. */
export const EditCellTree = ({state, record, column, update}: CellEditorProps) => {
  const data = column.lookupData as LookupTree;
  const [open, setOpen] = useState(false);
  const [innerValue, setInnerValue] = useState(record.cells[column.columnIndex]);

  const treeData = useMemo(() => {
    return createTree(data);
  }, [data]);

  const onChange = (value: any) => {
    update(value); setInnerValue(value);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    handleKeyDown(e, open, state.actions);
  };

  return (
    <TreeSelect
      variant={'borderless'} treeData={treeData} value={innerValue}
      showSearch={true} filterTreeNode={filterTreeNode}
      onChange={onChange} onKeyDown={onKeyDown} onDropdownVisibleChange={setOpen}
      popupClassName={'cell-editor-popup'} virtual={false}
    />
  );
};

function filterOption(value: string, option: any): boolean {
  return option.label.toLowerCase().startsWith(value.toLowerCase());
}
function filterTreeNode(value: string, node: any): boolean {
  return node.title.toLowerCase().startsWith(value.toLowerCase());
}

function handleKeyDown(e: KeyboardEvent, open: boolean, actions: TableActions): void {
  const key = e.nativeEvent.key;
  if (open && (key === 'Enter' || key === 'ArrowUp' || key === 'ArrowDown')) {
    return e.stopPropagation();
  }
  if (key === 'ArrowLeft') {
    actions.moveCellHorizontal(-1);
  } else if (key === 'ArrowRight') {
    actions.moveCellHorizontal(1);
  }
}

function createTree(data: LookupTree): any[] {
  const toOption = ({id, value, children}: LookupTreeNode): any => {
    if (children) children = children.map(toOption);
    return {value: id, title: value, children};
  };
  return data.map(toOption);
}
