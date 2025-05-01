import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import type { TableColumnModel, TableState } from '../../lib/types';
import { clsx } from 'clsx';
import { showDetailsTable, showDetailsWindow } from '../../store/details-table';
import { EditedCell } from './edited-cell';


interface TableCellProps {
  state: TableState;
  column: TableColumnModel;
  record: TableRecord;
  rowStyle: CSSProperties;
}


export const TableCell = ({state, column, record, rowStyle}: TableCellProps) => {
  const { id, fixed, link, detailChannel: details } = column;
  const activeCell = state.data.activeCell;
  const active = activeCell.row === record.index && activeCell.column === id;

  if (active && activeCell.edited && column.editable && column.columnIndex !== -1) {
    return <EditedCell state={state} column={column} record={record}/>;
  }
  let style = {...column.cellStyle};
  if (rowStyle) {
    style = {...style};
    if (rowStyle.color) style.color = rowStyle.color;
    if (rowStyle.backgroundColor) style.backgroundColor = rowStyle.backgroundColor;
  }
  if (fixed && !style.backgroundColor) {
    const settings = state.globalSettings;
    const alternateBg = settings.alternate && settings.alternateBackground;
    if (alternateBg && record.index % 2) style.backgroundColor = alternateBg;
  }

  const content = getCellContent(column, record);
  const className = clsx(fixed && 'cell-sticky', (details || link) && 'cell-details', active && 'cell-active');
  const onCellClick = (e: MouseEvent<HTMLTableCellElement>) => state.actions.cellClick(record.index, id, e);

  if (details || link) {
    const onButtonClick = link
      ? () => showDetailsWindow(state.id, link)
      : () => showDetailsTable(state.id, id);
    return (
      <td className={className} style={style} onClick={onCellClick}>
        <div>
          <span>{content}</span>
          <button onClick={onButtonClick} title={'Показать детальную информацию'}/>
        </div>
      </td>
    );
  }
  return <td className={className} style={style} onClick={onCellClick}>{content}</td>;
};

function getCellContent(column: TableColumnModel, record: TableRecord): ReactNode {
  const value = record.renderValues[column.id];
  if (value === null) return null;

  if (column.type === 'color') {
    return <div style={{backgroundColor: value, width: '100%', height: 15}}/>;
  }
  return value;
}
