import type { CSSProperties, ReactElement, MutableRefObject, MouseEvent } from 'react';
import type { TableState, TableColumnModel } from '../../lib/types';
import { Empty } from 'antd';
import { useRender } from 'shared/react';
import { updateChannelLimit } from 'entities/channel';
import { TableRow } from './table-row';
import { updateTableState } from '../../store/table.actions';
import { rowHeight, scrollWidth } from '../../lib/constants';


interface TableBodyProps {
  state: TableState;
  query: ChannelQuerySettings;
  bodyRef: MutableRefObject<HTMLDivElement>;
}


export const TableBody = ({state, query, bodyRef}: TableBodyProps) => {
  const render = useRender();
  const { headLayout, totalWidth, leafs: columns } = state.columns;
  const { textWrap, alternate, alternateBackground } = state.globalSettings;

  let records = state.data.records;
  const availableHeight = 'calc(100% - ' + (headLayout.length * rowHeight + scrollWidth) + 'px)';

  if (records.length === 0) {
    return (
      <div ref={bodyRef} className={'tbody-container'} style={{height: availableHeight}}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{width: totalWidth}}/>
      </div>
    );
  }

  const onMouseDown = () => {
    state.selection.cursor.check = true;
  };
  const onMouseUp = () => {
    state.selection.cursor.stop();
  };
  const onMouseMove = (e: MouseEvent) => {
    if (state.data.activeCell.edited) return;
    const cursorSelection = state.selection.cursor;
    let changed: boolean;

    if (cursorSelection.active) {
      changed = cursorSelection.handleMove(e);
    } else if (cursorSelection.check) {
      cursorSelection.start(e); changed = true;
    }
    if (changed) updateTableState(state.id);
  };

  const onLimitChange = () => {
    const limit = query.limit;
    const total = state.data.records.length;
    if (limit === total) updateChannelLimit(state.channelID, limit + 250).then();
  };
  const onVerticalScroll = () => {
    state.viewport.handleVerticalScroll(render, onLimitChange);
  };

  let tableClass: string;
  let heightSetter: ReactElement;
  const virtual = state.viewport.virtual;
  const tableStyle: CSSProperties & {'--wm-alternate-bg'?: string} = {width: totalWidth};

  if (textWrap === false) {
    tableStyle.textWrap = 'nowrap';
  }
  if (alternate) {
    tableClass = 'tbody-alternate';
    tableStyle['--wm-alternate-bg'] = alternateBackground;
  }
  if (virtual) {
    tableStyle.textWrap = 'nowrap';
    tableStyle.transform = `translateY(${virtual.offset}px)`;
    heightSetter = <div className={'h-setter'} style={{height: virtual.height}}/>;
    records = records.slice(virtual.start, virtual.end);
  }

  const toRowElement = (record: TableRecord) => {
    return <TableRow key={record.index} state={state} record={record}/>;
  };
  const toColElement = (column: TableColumnModel) => {
    return <col key={column.id} style={{width: column.width}}/>;
  };

  return (
    <div
      ref={bodyRef} className={'tbody-container'} style={{height: availableHeight}}
      onMouseDown={onMouseDown} onMouseUp={onMouseUp}
      onMouseMove={onMouseMove} onMouseLeave={onMouseUp} onScroll={onVerticalScroll}
    >
      <table className={tableClass} style={tableStyle}>
        <colgroup>{columns.map(toColElement)}</colgroup>
        <tbody>{records.map(toRowElement)}</tbody>
      </table>
      {heightSetter}
    </div>
  );
};
