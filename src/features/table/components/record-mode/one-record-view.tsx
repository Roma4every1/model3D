import type { CSSProperties, KeyboardEvent, MouseEvent } from 'react';
import type { RecordModeState, TableColumnModel, TableState } from '../../lib/types';
import { useState } from 'react';
import { useRender } from 'shared/react';
import { showDetailsTable } from '../../store/table.thunks';
import './one-record-view.scss';


interface OneRecordViewProps {
  state: TableState;
}
interface OneRecordCellProps {
  state: TableState;
  column: TableColumnModel;
  record: TableRecord;
}
interface OneRecordResizerProps {
  state: RecordModeState;
}


/** Вид формы в режиме одной записи. */
export const OneRecordView = ({state}: OneRecordViewProps) => {
  const render = useRender();
  const columns = state.columns.leafs;
  const record = state.data.records[0];
  const recordModeState = state.recordMode;
  const { keyColumnWidth, activeColumn: activeID } = recordModeState;

  const toFieldElement = (column: TableColumnModel) => {
    const id = column.id;
    const className = activeID === id ? 'active' : undefined;

    const onClick = () => {
      recordModeState.activeColumn = id;
      render();
    };
    return (
      <tr key={id} className={className} onClick={onClick}>
        <td>{column.displayName}</td>
        <OneRecordCell state={state} column={column} record={record}/>
      </tr>
    );
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (activeID === null) return;
    const key = e.nativeEvent.key;
    const activeColumn = state.columns.dict[activeID];

    if (key === 'Escape') {
      recordModeState.activeColumn = null;
      render();
    } else if (key === 'ArrowUp') {
      const newIndex = activeColumn.displayIndex - 1;
      if (newIndex < 0) return;
      recordModeState.activeColumn = columns[newIndex].id;
      render();
    } else if (key === 'ArrowDown') {
      const newIndex = activeColumn.displayIndex + 1;
      if (newIndex === columns.length) return;
      recordModeState.activeColumn = columns[newIndex].id;
      render();
    }
  };

  let tableClass: string;
  let tableStyle: Record<string, string>;
  const { alternate, alternateBackground } = state.globalSettings;

  if (alternate) {
    tableClass = 'one-record tbody-alternate';
    if (alternateBackground) tableStyle = {'--wm-alternate-bg': alternateBackground};
  } else {
    tableClass = 'one-record';
  }

  return (
    <>
      <table className={tableClass} style={tableStyle} tabIndex={0} onKeyDown={onKeyDown}>
        <colgroup>
          <col style={{width: keyColumnWidth}}/>
        </colgroup>
        <tbody>{columns.map(toFieldElement)}</tbody>
      </table>
      <OneRecordResizer state={recordModeState}/>
    </>
  );
};

const OneRecordCell = ({state, column, record}: OneRecordCellProps) => {
  const details = column.detailChannel;
  const cellText = record?.renderValues[column.id];
  if (!details) return <td>{cellText}</td>;

  return (
    <td className={'cell-details'}>
      <div>
        <span>{cellText}</span>
        <button
          onClick={() => showDetailsTable(state.id, column.id)}
          title={'Показать детальную информацию'}
        />
      </div>
    </td>
  );
};

const OneRecordResizer = ({state}: OneRecordResizerProps) => {
  const [move, setMove] = useState(false);
  const onMouseDown = () => setMove(true);
  const onMouseUp = () => setMove(false);

  const onMouseMove = (e: MouseEvent) => {
    if (!move) return;
    state.keyColumnWidth += e.movementX;
    const width = state.keyColumnWidth;

    const div = e.target as HTMLDivElement;
    div.style.left = (width - 40) + 'px';
    const col = div.previousElementSibling.firstElementChild.firstElementChild as HTMLElement;
    col.style.width = width + 'px';
  };

  const halfWidth = move ? 40 : 4;
  const style: CSSProperties = {left: state.keyColumnWidth - halfWidth, width: halfWidth * 2};

  return (
    <div
      className={'one-record-resizer'} style={style}
      onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseMove={onMouseMove}
    />
  );
};
