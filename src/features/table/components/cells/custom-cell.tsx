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
      if (state.editable && !activeCell.edited) actions.startEdit(columnID, recordID);
    } else {
      const edited = activeCell.edited && isActiveRecord;
      actions.setActiveCell({columnID, recordID, edited});
    }
  };
  const onDoubleClick = state.editable ? () => {
    if (isActiveCell && activeCell.edited) return;
    actions.startEdit(columnID, recordID);
  } : undefined;

  let cell;
  const tdProps: ComponentProps<'td'> = {...td.props, onClick, onDoubleClick};
  if (isActiveCell) {
    tdProps.id = columnID + '-' + recordID;
    tdProps.style = {...tdProps.style, padding: 2, boxShadow: 'inset 0 0 0 2px #f3afa7'};
  }

  if (isActiveCell && activeCell.edited) {
    const value = dataItem[columnID];
    const update = (value: any) => actions.setValue(columnID, recordID, value);
    cell = <BaseEditCell column={column} value={value} actions={actions} update={update}/>;
  } else {
    if (column.lookupChannel) {
      cell = column.lookupDict[dataItem[columnID]];
    }
    if (column.linkedTableChannel) {
      const open = () => actions.openLinkedTable(columnID);
      cell = <LinkedTableCell value={cell ?? dataItem[columnID]} column={column} open={open}/>;
    }
  }
  return cell ? cloneElement(td, tdProps, cell) : cloneElement(td, tdProps);
};
