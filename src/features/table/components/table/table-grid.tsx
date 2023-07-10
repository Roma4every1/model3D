import { ReactElement, KeyboardEvent } from 'react';
import { useState, useLayoutEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { IntlProvider, LocalizationProvider } from '@progress/kendo-react-intl';
import { Grid, GridProps, GridCellProps } from '@progress/kendo-react-grid';
import { GridColumnResizeEvent, GridPageChangeEvent } from '@progress/kendo-react-grid';
import { GridSelectionChangeEvent, getSelectedState } from '@progress/kendo-react-grid';
import { compareObjects } from 'shared/lib';
import { setOpenedWindow } from 'entities/windows';
import { updateMaxRowCount } from 'entities/channels';

import { ToolbarActions, CellActions, SaveTableMetadata, SetRecords } from '../../lib/types';
import { scrollCellIntoView } from '../../lib/common';
import { rollbackRecord, applyRecordEdit, validateRecord } from '../../lib/records';
import { applyColumnsWidth } from '../../lib/column-tree-actions';
import { setTableColumns, setTableSelection } from '../../store/table.actions';
import { setTableActiveCell, startTableEditing, endTableEditing } from '../../store/table.actions';
import { getNewRow, saveTableRecord } from '../../store/table.thunks';

import { CustomCell } from '../cells/custom-cell';
import { TableToolbar } from '../toolbar/table-toolbar';
import { ValidationDialog } from '../dialogs/validation';
import { DeleteRecordsDialog } from '../dialogs/delete-records';
import { LinkedTable } from './linked-table';


interface TableGridProps {
  id: FormID,
  state: TableState,
  query: ChannelQuerySettings,
  records: TableRecord[],
  setRecords: SetRecords,
  children: JSX.Element[],
}


export const TableGrid = ({id, state, query, records, setRecords, children}: TableGridProps) => {
  const dispatch = useDispatch();
  const [skip, setSkip] = useState(0);
  const pageSize = 50;

  const { columns: columnsState, selection, activeCell, total, edit } = state;
  const activeRecordID = activeCell.recordID, activeColumnID = activeCell.columnID;

  const isTopCell = activeRecordID === 0;
  const isBottomCell = activeRecordID === total - 1;

  const isEditing = activeCell.edited;
  const selectedRecords = Object.keys(selection).map((n) => parseInt(n));

  const ref = useRef<HTMLDivElement>();
  const container = ref.current;

  const data = useMemo(() => {
    records.forEach((record) => { record.selected = selection[record.id]; });
    return records;
  }, [selection, records]);

  const contentElement = useMemo(() => {
    return container?.querySelector('.k-grid-content');
  }, [container]);

  // сохранение полной видимости активной ячейки
  useLayoutEffect(() => {
    if (!contentElement || activeRecordID === null || activeColumnID === null) return;
    if (isTopCell) contentElement.scrollTo({top: 0});
    if (isBottomCell) contentElement.scrollBy({top: 1e10});

    const cellID = activeColumnID + '-' + activeRecordID;
    const cell = document.getElementById(cellID) as HTMLTableCellElement;

    if (cell) {
      scrollCellIntoView(contentElement, cell);
    } else {
      contentElement.scrollBy({top: -28, behavior: 'smooth'});
    }
  }, [activeRecordID, activeColumnID, isTopCell, isBottomCell, contentElement]);

  /* --- Editing --- */

  const addRecord = (copy: boolean, index?: number) => {
    if (!state.editable || edit.isNew) return;
    if (activeRecordID === null) contentElement?.scrollTo({top: 0});
    dispatch(getNewRow(id, state, setRecords, copy, index));
  };

  const saveRecord = (record: TableRecord) => {
    const rowErrors = validateRecord(record, columnsState);
    if (rowErrors.length) {
      const windowID = 'record-validation';
      const window = <ValidationDialog key={windowID} errors={rowErrors} columns={columnsState}/>;
      dispatch(setOpenedWindow(windowID, true, window));
      return false;
    }
    applyRecordEdit(record, columnsState);

    const row: ChannelRow = {ID: record.id, Cells: record.cells};
    const data: SaveTableMetadata = edit.isNew
      ? {type: 'insert', formID: id, row}
      : {type: 'update', formID: id, row};
    dispatch(saveTableRecord(data));
  };

  const deleteRecords = () => {
    const windowID = 'delete-records';
    const window = <DeleteRecordsDialog key={windowID} id={id} ids={selectedRecords}/>;
    dispatch(setOpenedWindow(windowID, true, window));
  };

  const startEdit = (columnID: string, recordID: TableRecordID) => {
    if (!state.editable) return;
    dispatch(startTableEditing(id, columnID, recordID, edit.isNew));
  };

  const endEdit = (apply: boolean) => {
    container?.focus();
    if (!isEditing) return;
    const activeIndex = records.findIndex(rec => rec.id === activeRecordID);
    const activeRecord = records[activeIndex];

    if (apply) {
      if (edit.modified) {
        const isSave = saveRecord(activeRecord);
        if (isSave === false) return;
      }
    } else {
      if (edit.isNew) {
        records.splice(activeIndex, 1);
      } else {
        rollbackRecord(activeRecord, columnsState);
      }
      setRecords(records);
    }
    dispatch(endTableEditing(id));
  };

  // вызовы: onKeyDown (Enter && edited), Toolbar -> AcceptButton, setSelection
  const acceptEdit = () => endEdit(true);
  // вызовы: onKeyDown (Escape), Toolbar -> CancelButton
  const cancelEdit = () => endEdit(false);

  /* --- Selection --- */

  const setSelection = (newSelection: TableSelection) => {
    dispatch(setTableSelection(id, newSelection));
  };

  const setActiveCell = (cell: TableActiveCell) => {
    if (cell.recordID !== activeRecordID && edit.modified) {
      const activeRecord = records.find(rec => rec.id === activeRecordID);
      const isSave = saveRecord(activeRecord);
      if (isSave === false) return;
    }
    dispatch(setTableActiveCell(id, cell));
  };

  /** Двигает активную ячейку горизотально; если `by > 0`, то вправо. */
  const moveCellHorizontal = (by: number) => {
    if (!activeColumnID) return;
    const flatten = state.columnTreeFlatten;
    const oldIndex = flatten.findIndex(id => id === activeColumnID);
    const newIndex = oldIndex + by;
    if (newIndex < 0 || newIndex >= flatten.length) return;
    setActiveCell({...activeCell, columnID: flatten[newIndex]});
  };

  /** Двигает активную ячейку вертикально; если `by > 0`, то вниз. */
  const moveCellVertical = (by: number) => {
    if (selectedRecords.length === 0) return;
    const newRecordID = activeRecordID
      ? activeRecordID + by
      : (by > 0 ? Math.max : Math.min)(...selectedRecords) + by;
    if (newRecordID < 0 || newRecordID >= total) return;
    setActiveCell({...activeCell, recordID: newRecordID});
  };

  const toStart = () => {
    const newRecordID = records[0]?.id;
    if (newRecordID !== undefined) setActiveCell({...activeCell, recordID: newRecordID});
  };

  const toEnd = () => {
    const newRecordID = records.at(-1)?.id;
    if (newRecordID !== undefined) setActiveCell({...activeCell, recordID: newRecordID});
  };

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    if (isEditing) return;
    const options = {event, selectedState: selection, dataItemKey: 'id'}
    const newSelection = getSelectedState(options) as TableSelection;

    if (compareObjects(selection, newSelection)) return;
    setSelection(newSelection);
  };

  /* --- --- */

  const onKeyDown = (event: KeyboardEvent) => {
    switch (event.nativeEvent.key) {
      case 'Enter': {
        if (activeRecordID !== null) {
          isEditing
            ? acceptEdit()
            : startEdit(activeColumnID, activeRecordID);
        }
        break;
      }
      case 'Escape': {
        if (isEditing) {
          cancelEdit();
        } else {
          setActiveCell({columnID: null, recordID: null, edited: false});
          setSelection({});
        }
        break;
      }
      case 'Insert': {
        addRecord(event.ctrlKey); break;
      }
      case 'Delete': {
        if (selectedRecords.length && !edit.isNew) deleteRecords(); break;
      }
      case 'ArrowUp':
      case 'PageUp': {
        event.preventDefault();
        if (isEditing && columnsState[activeColumnID].type === 'date') break;
        event.ctrlKey ? toStart() : moveCellVertical(-1); break;
      }
      case 'ArrowDown':
      case 'PageDown': {
        event.preventDefault();
        if (isEditing && columnsState[activeColumnID].type === 'date') break;
        event.ctrlKey ? toEnd() : moveCellVertical(1);
        if (isBottomCell) addRecord(event.ctrlKey, state.total); break;
      }
      case 'ArrowLeft': {
        if (!isEditing) moveCellHorizontal(-1); break;
      }
      case 'ArrowRight': {
        if (!isEditing) moveCellHorizontal(1); break;
      }
      case 'Home': {
        toStart(); break;
      }
      case 'End': {
        toEnd(); break;
      }
      case 'a':
      case 'A':
      case 'ф':
      case 'Ф': {
        if (!event.ctrlKey || isEditing) return;
        event.preventDefault();
        const selection: TableSelection = {};
        records.forEach((record) => { selection[record.id] = true; });
        setSelection(selection);
      }
    }
  };

  const onColumnResize = (event: GridColumnResizeEvent) => {
    if (!event.end) return;
    applyColumnsWidth(columnsState, event.columns);
    dispatch(setTableColumns(id, {...columnsState}));
  };

  const setValue = (columnID: string, recordID: TableRecordID, value: any) => {
    const record = records.find(rec => rec.id === recordID);
    if (record[columnID] === value) return;
    edit.modified = true;
    record[columnID] = value;
    setRecords(records);
  };

  const openLinkedTable = (columnID: TableColumnID) => {
    const linkedTableID = id + columnID;
    const onClose = () => dispatch(setOpenedWindow(linkedTableID, false, null));
    const window = <LinkedTable key={linkedTableID} id={linkedTableID} onClose={onClose}/>;
    dispatch(setOpenedWindow(linkedTableID, true, window));
  };

  const cellActions: CellActions = {
    setActiveCell, setValue,
    startEdit, moveCellHorizontal, openLinkedTable,
  };
  const toolbarActions: ToolbarActions = {
    acceptEdit, cancelEdit,
    addRecord, deleteRecords,
    moveCellVertical, toStart, toEnd,
  };

  const cellRender = (td: ReactElement, props: GridCellProps) => {
    return <CustomCell td={td} props={props} state={state} actions={cellActions}/>;
  };

  // если данных много, то использовать виртуальную прокрутку
  const scrollProps: Partial<GridProps> = total > 99 ? {
    scrollable: 'virtual',
    data: data.slice(skip, skip + pageSize),
    skip, total, pageSize,
    onPageChange: (event: GridPageChangeEvent) => {
      const newSkip = event.page.skip; setSkip(newSkip);
      if (newSkip + pageSize > total && total === query.maxRowCount) {
        dispatch(updateMaxRowCount(state.channelName, total + 2 * pageSize));
      }
    },
  } : {
    scrollable: 'scrollable',
    data: data,
  };

  return (
    <div className={'table-container'} tabIndex={0} onKeyDown={onKeyDown} ref={ref}>
      <TableToolbar
        id={id} state={state}
        actions={toolbarActions} selectedRecords={selectedRecords}
      />
      <LocalizationProvider language={'ru-RU'}>
        <IntlProvider locale={'ru'}>
          <Grid
            style={{height: '100%'}}
            {...scrollProps} fixedScroll={true} rowHeight={28}
            dataItemKey={'id'} selectedField={'selected'}
            groupable={false} reorderable={false} navigatable={false}
            resizable={true} onColumnResize={onColumnResize}
            selectable={{drag: !isEditing}} onSelectionChange={onSelectionChange}
            cellRender={cellRender}
          >
            {children}
          </Grid>
        </IntlProvider>
      </LocalizationProvider>
    </div>
  );
};
