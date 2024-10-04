import type { CSSProperties } from 'react';
import type { TableColumnModel, TableState } from '../../lib/types';
import { useState } from 'react';
import { TableCell } from './table-cell';


interface TableRowProps {
  state: TableState;
  record: TableRecord;
}


export const TableRow = ({record, state}: TableRowProps) => {
  const [hover, setHover] = useState(false);
  const onMouseOver = () => setHover(true);
  const onMouseOut = () => setHover(false);

  let style: CSSProperties = record.style;
  if (state.selection.has(record.index)) {
    style = {color: 'unset', backgroundColor: 'var(--wm-primary-70)'};
  } else if (hover) {
    style = {color: 'unset', backgroundColor: 'var(--wm-primary-85)'};
  }

  const toCellElement = (c: TableColumnModel) => {
    return <TableCell key={c.id} state={state} column={c} record={record} rowStyle={style}/>;
  };
  return (
    <tr
      key={record.id} data-index={record.index} style={style}
      onMouseOver={onMouseOver} onMouseOut={onMouseOut}
    >
      {state.columns.leafs.map(toCellElement)}
    </tr>
  );
};
