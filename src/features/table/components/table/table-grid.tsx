import { ReactElement, ReactNode, KeyboardEvent } from 'react';
import { useState, useLayoutEffect, useMemo, useRef } from 'react';
import { compareObjects } from 'shared/lib';
import { IntlProvider, LocalizationProvider } from '@progress/kendo-react-intl';
import { Grid, GridCellProps } from '@progress/kendo-react-grid';
import { GridColumnResizeEvent, GridPageChangeEvent } from '@progress/kendo-react-grid';
import { GridSelectionChangeEvent, getSelectedState } from '@progress/kendo-react-grid';
import { showDialog, closeWindow } from 'entities/window';
import { updateChannelLimit } from 'entities/channel';

import { ToolbarActions, CellActions, SaveTableMetadata, SetRecords } from '../../lib/types';
import { scrollCellIntoView } from '../../lib/common';
import { applyColumnsWidth } from '../../lib/column-tree-actions';
import { setTableColumns, setTableSelection } from '../../store/table.actions';
import { setTableActiveCell, startTableEditing, endTableEditing } from '../../store/table.actions';
import { getNewRow, saveTableRecord, showLinkedTable, updateActiveRecord } from '../../store/table.thunks';

import { CustomCell } from '../cells/custom-cell';
import { TableToolbar } from '../toolbar/table-toolbar';
import { ValidationDialog } from '../dialogs/validation';
import { DeleteRecordsDialog } from '../dialogs/delete-records';
import { useTranslation } from 'react-i18next';
import { RecordModeGrid } from './record-mode-grid';


interface TableGridProps {
  id: FormID;
  state: TableState;
  query: ChannelQuerySettings;
  records: TableRecord[];
  setRecords: SetRecords;
  children: ReactNode;
}


export const TableGrid = ({id, state, query, records, setRecords, children}: TableGridProps) => {
  const { t } = useTranslation();
  const [skip, setSkip] = useState(0);
  const pageSize = 50;

  const isTableMode = state.columnsSettings?.tableMode;
  const { recordHandler, columns: columnsState, selection, activeCell, total, edit } = state;
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
    getNewRow(id, state, setRecords, copy, index).then();
  };

  const saveRecord = (record: TableRecord) => {
    if (!edit.isNew) {
      const errors = recordHandler.validateRecord(record);
      if (errors.length) {
        const windowID = 'record-validation';
        const onClose = () => closeWindow(windowID);

        const windowProps = {
          title: t('table.validation-dialog.header'),
          width: 500, height: 250, resizable: false, onClose,
        };
        const content = <ValidationDialog errors={errors} columns={columnsState} t={t} onClose={onClose}/>;
        showDialog(windowID, windowProps, content);
        return false;
      }
    }
    recordHandler.applyRecordEdit(record);

    const data: SaveTableMetadata = edit.isNew
      ? {type: 'insert', formID: id, rowID: record.id, row: record.cells}
      : {type: 'update', formID: id, rowID: record.id, row: record.cells};
    saveTableRecord(data).then();
  };

  const deleteRecords = () => {
    const windowID = 'delete-records';
    const onClose = () => closeWindow(windowID);

    const windowProps = {title: t('table.delete-dialog.header'), resizable: false, onClose};
    const content = <DeleteRecordsDialog id={id} indexes={selectedRecords} t={t} onClose={onClose}/>;
    showDialog(windowID, windowProps, content);
  };

  const startEdit = (columnID: string, recordID: TableRecordID) => {
    if (!state.editable) return;
    startTableEditing(id, columnID, recordID, edit.isNew);
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
        recordHandler.rollbackRecord(activeRecord);
      }
      setRecords(records);
    }
    endTableEditing(id);
  };

  // вызовы: onKeyDown (Enter && edited), Toolbar -> AcceptButton, setSelection
  const acceptEdit = () => endEdit(true);
  // вызовы: onKeyDown (Escape), Toolbar -> CancelButton
  const cancelEdit = () => endEdit(false);

  /* --- Selection --- */

  const setSelection = (newSelection: TableSelection) => {
    setTableSelection(id, newSelection);
  };

  const setActiveCell = (cell: TableActiveCell) => {
    if (cell.recordID !== activeRecordID) {
      if (edit.modified) {
        const activeRecord = records.find(rec => rec.id === activeRecordID);
        const isSave = saveRecord(activeRecord);
        if (isSave === false) return;
      }
      updateActiveRecord(id, cell.recordID).then();
    }
    setTableActiveCell(id, cell);
  };

  const setValue = (columnID: string, recordID: TableRecordID, value: any) => {
    const record = records.find(rec => rec.id === recordID);
    if (record[columnID] === value) return;
    edit.modified = true;
    record[columnID] = value;
    setRecords(records);
  };

  /** Двигает активную ячейку горизотально; если `by > 0`, то вправо. */
  const moveCellHorizontal = (by: number, to?: number) => {
    if (!activeColumnID) return;
    let newIndex;
    const flatten = state.columnTreeFlatten;

    if (to !== undefined) {
      newIndex = to < 0 ? flatten.length + to : to;
    } else {
      const oldIndex = flatten.findIndex(id => id === activeColumnID);
      newIndex = oldIndex + by;
      if (newIndex < 0 || newIndex >= flatten.length) return;
    }
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

  /** Двигает активную ячейку вертикально на 1 вверх. */
  const prevCellHandler = (event: KeyboardEvent) => {
    event.preventDefault();
    if (isEditing && columnsState[activeColumnID].type === 'date') return;
    event.ctrlKey ? toStart() : moveCellVertical(-1); return;
  }

  /** Двигает активную ячейку вертикально на 1 вниз. */
  const nextCellHandler = (event: KeyboardEvent) => {
    event.preventDefault();
    if (isEditing && columnsState[activeColumnID].type === 'date') return;
    event.ctrlKey ? toEnd() : moveCellVertical(1);
    if (isBottomCell) addRecord(event.ctrlKey, state.total); return;
  }

  /** Двигает активную ячейку горизонтально на 1 влево. */
  const prevColumnHandler = () => {
    if (!isEditing) moveCellHorizontal(-1);
  }

  /** Двигает активную ячейку горизонтально на 1 вправо. */
  const nextColumnHandler = () => {
    if (!isEditing) moveCellHorizontal(1);
  }

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
        addRecord(event.ctrlKey);
        break;
      }
      case 'Delete': {
        if (selectedRecords.length && !edit.isNew && !isEditing) deleteRecords();
        break;
      }
      case 'ArrowUp':
      case 'PageUp': {
        if (isTableMode) prevCellHandler(event);
        else prevColumnHandler();
        break;
      }
      case 'ArrowDown':
      case 'PageDown': {
        if (isTableMode) nextCellHandler(event);
        else nextColumnHandler();
        break;
      }
      case 'ArrowLeft': {
        if (isTableMode) prevColumnHandler();
        else prevCellHandler(event);
        break;
      }
      case 'ArrowRight': {
        if (isTableMode) nextColumnHandler();
        else nextCellHandler(event);
        break;
      }
      case 'Home': {
        if (isEditing) {
          event.preventDefault();
        } else {
          moveCellHorizontal(undefined, 0);
        }
        break;
      }
      case 'End': {
        if (isEditing) {
          event.preventDefault();
        } else {
          moveCellHorizontal(undefined, -1);
        }
        break;
      }
      case 'Tab': {
        if (activeColumnID === null) return;
        event.preventDefault();
        const currentIndex = state.columnTreeFlatten.findIndex(id => id === activeColumnID);

        if (currentIndex === state.columnTreeFlatten.length - 1) {
          activeCell.columnID = state.columnTreeFlatten[0];
          moveCellVertical(1);
        } else {
          moveCellHorizontal(1);
        }
        break;
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
    setTableColumns(id, {...columnsState});
  };

  const openLinkedTable = (columnID: TableColumnID) => {
    showLinkedTable(id, columnID);
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

  const onPageChange = (event: GridPageChangeEvent) => {
    const newSkip = event.page.skip; setSkip(newSkip);
    if (newSkip + pageSize > total && total === query.limit) {
      updateChannelLimit(state.channelID, total + 2 * pageSize).then();
    }
  };

  return (
    <div className={'table-container'} tabIndex={0} onKeyDown={onKeyDown} ref={ref}>
      <TableToolbar
        id={id} state={state}
        actions={toolbarActions} selectedRecords={selectedRecords}
      />
      <LocalizationProvider language={'ru-RU'}>
        <IntlProvider locale={'ru'}>
          {isTableMode ? <Grid
            data={data.slice(skip, skip + pageSize)}
            dataItemKey={'id'} selectedField={'selected'}
            style={{height: '100%'}} rowHeight={28} total={total}
            scrollable={'virtual'} fixedScroll={true}
            groupable={false} reorderable={false} navigatable={false}
            skip={skip} pageSize={pageSize} onPageChange={onPageChange}
            resizable={true} onColumnResize={onColumnResize}
            selectable={{drag: !isEditing}} onSelectionChange={onSelectionChange}
            cellRender={cellRender}
          >
            {children}
          </Grid> : <RecordModeGrid
            state={state}
            cellRender={cellRender}
            activeRecord={records.find(r => r.id === activeCell.recordID) ?? records[0]}
            actions={cellActions}
          />}
        </IntlProvider>
      </LocalizationProvider>
    </div>
  );
};
