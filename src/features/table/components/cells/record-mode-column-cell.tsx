import { cloneElement, ComponentProps, ReactElement } from 'react';
import { GridCellProps } from '@progress/kendo-react-grid';
import { CellActions } from '../../lib/types';


interface RecordModeColumnCellProps {
  td: ReactElement,
  props: GridCellProps,
  state: TableState,
  actions: CellActions,
}


export const RecordModeColumnCell  = ({td, props, state, actions}: RecordModeColumnCellProps) => {
  const { field: columnID, dataItem } = props;
  const recordID = dataItem.id;

  const activeCell = state.activeCell;
  const isActiveCell = activeCell.columnID === columnID;

  const onClick = () => {
    if (isActiveCell) return;
    actions.setActiveCell({columnID, recordID, edited: false});
  };

  const tdProps: ComponentProps<'td'> = {...td.props, onClick};

  return cloneElement(td, tdProps);
};
