import { CellActions } from '../../lib/types';
import { GridCellProps } from '@progress/kendo-react-grid';
import { ReactElement, ComponentProps, cloneElement } from 'react';
import { BaseEditCell } from './base-edit-cell';
import { LinkedTableCell } from './linked-table-cell';


interface CustomCellProps {
  td: ReactElement,
  props: GridCellProps,
  state: TableState,
  actions: CellActions,
}


export const CustomCell = ({td, props, state, actions}: CustomCellProps) => {
  const { field: columnID, dataItem } = props;
  const column = state.columns[columnID];
  const recordID = dataItem.id;

  const activeCell = state.activeCell;
  const isActiveRecord = activeCell.recordID === recordID;
  const isActiveCell = activeCell.columnID === columnID && isActiveRecord;

  const onClick = () => {
    if (isActiveCell) {
      if (!activeCell.edited) actions.startEdit(columnID, recordID);
    } else {
      const edited = activeCell.edited && isActiveRecord;
      actions.setActiveCell({columnID, recordID, edited});
    }
  };
  const onDoubleClick = state.editable ? () => {
    if (isActiveCell && activeCell.edited) return;
    actions.startEdit(columnID, recordID);
  } : undefined;

  const tdProps: ComponentProps<'td'> = {...td.props, onClick, onDoubleClick};
  let tdStyle = tdProps.style;

  if (dataItem.style && !isActiveRecord) {
    tdProps.style = {...tdStyle, ...dataItem.style};
  }
  if (isActiveCell) {
    tdProps.id = columnID + '-' + recordID;
    tdStyle.padding = 2;
    tdStyle.boxShadow = 'inset 0 0 0 2px #f3afa7';
  }

  let cell = null;
  if (isActiveCell && activeCell.edited) {
    const value = dataItem[columnID];
    const update = column.type
      ? (value: any) => actions.setValue(columnID, recordID, value)
      : () => {};
    cell = <BaseEditCell column={column} value={value} actions={actions} update={update}/>;
  } else {
    if (column.lookupChannel) {
      cell = column.lookupDict[dataItem[columnID]];
    }
    if (column.linkedTableChannel) {
      const open = () => actions.openLinkedTable(columnID);
      const value = cell === null ? dataItem[columnID] : cell;
      cell = <LinkedTableCell value={value} column={column} open={open}/>;
    }
  }
  return cell === null ? cloneElement(td, tdProps) : cloneElement(td, tdProps, cell);
};
