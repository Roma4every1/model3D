import type { MutableRefObject, MouseEvent, CSSProperties } from 'react';
import type { TableState, TableColumnModel, TableHeadLayoutRow } from '../../lib/types';
import { useState } from 'react';
import { Popover } from 'antd';
import { ColumnFilter } from './column-filter';
import { updateChannelSortOrder } from 'entities/channel';
import { setTableColumnWidth } from '../../store/table.actions';
import { minCellWidth, maxCellWidth } from '../../lib/constants';
import './thead.scss';


interface TableHeadProps {
  state: TableState;
  query: ChannelQuerySettings;
  headRef: MutableRefObject<HTMLDivElement>;
}
interface LeafCellProps {
  state: TableState;
  query: ChannelQuerySettings;
  column: TableColumnModel;
}


/** Компонент шапки таблицы. */
export const TableHead = ({state, query, headRef}: TableHeadProps) => {
  const columns = state.columns;
  const { headLayout, leafs, totalWidth } = columns;

  const toColElement = (column: TableColumnModel) => {
    return <col key={column.id} style={{width: column.width}}/>;
  };
  const toRowElement = (row: TableHeadLayoutRow, i: number) => {
    if (i === headLayout.length - 1) {
      const toCell = (column: any) => {
        return <LeafCell key={column.displayIndex} state={state} column={column} query={query}/>;
      };
      return <tr key={i} className={'thead-main-row'}>{row.map(toCell)}</tr>;
    } else {
      const toCell = (cell: any, j: number) => {
        const name = cell.displayName;
        return <th key={j} colSpan={cell.colSpan} style={cell.style} title={name}>{name}</th>
      };
      return <tr key={i} className={'thead-group-row'}>{row.map(toCell)}</tr>;
    }
  };

  return (
    <div className={'thead-container'} ref={headRef}>
      <table style={{width: totalWidth}}>
        <colgroup>{leafs.map(toColElement)}</colgroup>
        <thead>{headLayout.map(toRowElement)}</thead>
      </table>
    </div>
  );
};

const LeafCell = ({state, query, column}: LeafCellProps) => {
  const [dragStyle, setDragStyle] = useState<CSSProperties>();

  const onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    setDragStyle({top: -50, right: -50, width: 100, height: 100});
  };
  const onMouseUp = () => {
    if (dragStyle) setDragStyle(undefined);
  };
  const onMouseMove = (e: MouseEvent) => {
    if (!dragStyle) return;
    const width = column.width + e.movementX;
    if (width < minCellWidth || width > maxCellWidth) return;
    setTableColumnWidth(state.id, column.id, width);
  };

  const pClass = 'table-column-drag';
  const pOpen = dragStyle !== undefined;
  const pContent = column.width + 'px';

  return (
    <Popover rootClassName={pClass} open={pOpen} content={pContent} placement={'bottomLeft'}>
      <th className={column.fixed ? 'cell-sticky' : undefined} style={{...column.headerStyle}}>
        <HeadCellContent state={state} column={column} query={query}/>
        <div
          style={dragStyle}
          onMouseDown={onMouseDown} onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp} onMouseMove={onMouseMove}
        />
      </th>
    </Popover>
  );
};

const HeadCellContent = ({state, query, column}: LeafCellProps) => {
  const columnName = column.columnName;
  const direction = query.order?.find(o => o.column === columnName)?.direction ?? null;

  const changeSortOrder = () => {
    // по возврастанию -> по убыванию -> без порядка
    let newDirection: SortOrderDirection = null;
    if (direction === null) newDirection = 'desc';
    else if (direction === 'desc') newDirection = 'asc';
    const order = newDirection ? [{column: columnName, direction: newDirection}] : [];
    updateChannelSortOrder(state.channelID, order).then();
  };

  return (
    <div className={direction ? 'column-sort-' + direction : undefined}>
      <span onClick={changeSortOrder}>{column.displayName}</span>
      <HeadCellFilter state={state} column={column}/>
    </div>
  );
};

const HeadCellFilter = ({state, column}: Omit<LeafCellProps, 'query'>) => {
  const [filterOpen, setFilterOpen] = useState<boolean>();
  const columnFilter = column.filter;
  const disabled = !columnFilter || !state.globalSettings.filterEnabled;

  let iconStyle: CSSProperties;
  let pathStyle: CSSProperties;

  if (disabled) {
    iconStyle = {opacity: 0.3, cursor: 'default'};
  } else if (columnFilter.node && columnFilter.enabled) {
    pathStyle = {fill: 'var(--wm-primary-60)', stroke: 'black'};
  }

  const icon = (
    <svg xmlns={'http://www.w3.org/2000/svg'} viewBox={'0 0 32 32'} style={iconStyle}>
      <path d={'M5,4L27,4L27,8L19,16L19,22L13,28L13,16L5,8Z'} style={pathStyle}/>
    </svg>
  );
  if (disabled) return icon;

  const closeFilter = () => {
    setFilterOpen(false);
    setTimeout(() => setFilterOpen(undefined), 1);
  };
  const PopoverContent = () => {
    return <ColumnFilter state={state} column={column} close={closeFilter}/>;
  };

  return (
    <Popover content={PopoverContent} open={filterOpen} trigger={'click'} placement={'bottom'}>
      {icon}
    </Popover>
  );
};
