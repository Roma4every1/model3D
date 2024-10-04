import type { KeyboardEvent, MouseEvent } from 'react';
import type { TableState } from '../../lib/types';
import { showDialog, closeWindow } from 'entities/window';
import { TableView } from './table-view';
import { TableToolbar } from '../toolbar/table-toolbar';
import { DeleteRecordsDialog } from '../dialogs/delete-records';
import { setTableActiveCell, updateTableState } from '../../store/table.actions';
import { addTableRecord, updateActiveRecord, endTableEditing } from '../../store/table.thunks';


interface TableRootProps {
  state: TableState;
  query: ChannelQuerySettings;
  clientLoading: ClientLoadingState;
}


export const TableRoot = ({state, query, clientLoading}: TableRootProps) => {
  const { selection, actions } = state;
  const { records, activeCell, editable } = state.data;
  const { leafs: columns, dict: columnDict } = state.columns;

  const setActiveCell = (cell: TableActiveCell, resetSelection: boolean = true) => {
    const oldRow = activeCell.row;
    const newRow = cell.row;

    if (newRow !== null) {
      if (resetSelection) selection.reset(newRow);
      if (cell.column === null) cell.column = columns[0].id;
    }
    if (newRow !== oldRow) {
      updateActiveRecord(state.id, newRow).then();
      if (oldRow !== null && activeCell.edited) {
        endTableEditing(state.id, true, cell).then();
        return;
      }
    }
    setTableActiveCell(state.id, cell);
  };

  actions.endEdit = (save: boolean) => {
    endTableEditing(state.id, save).then();
  };

  actions.addRecord = (copy: boolean, index?: number) => {
    addTableRecord(state.id, copy, index).then();
  };

  actions.deleteRecords = () => {
    if (state.data.isNewRecord(activeCell.row)) {
      endTableEditing(state.id, false).then();
    } else {
      const windowID = 'delete-records';
      const onClose = () => closeWindow(windowID);
      const dialogProps = {title: 'Подтверждение', onClose};
      const content = <DeleteRecordsDialog state={state} onClose={onClose}/>;
      showDialog(windowID, dialogProps, content);
    }
  };

  actions.moveCellHorizontal = (by: number, to?: number) => {
    if (activeCell.column === null) return;
    const newIndex = to ?? columnDict[activeCell.column].displayIndex + by;
    if (newIndex < 0 || newIndex >= columns.length) return;
    setActiveCell({...activeCell, column: columns[newIndex].id}, false);
  };

  actions.moveCellVertical = (by: number, shiftKey?: boolean): void => {
    if (activeCell.row === null) return;
    const newRowIndex = activeCell.row + by;
    if (newRowIndex < 0 || newRowIndex >= records.length) return;

    if (shiftKey) {
      selection.resetWithAnchor(newRowIndex);
      setActiveCell({...activeCell, row: newRowIndex}, false);
    } else {
      setActiveCell({...activeCell, row: newRowIndex});
    }
  };

  actions.moveToFirst = () => {
    if (records.length) setActiveCell({...activeCell, row: 0});
  };
  actions.moveToLast = () => {
    if (records.length) setActiveCell({...activeCell, row: records.length - 1});
  };

  actions.cellClick = (row: number, column: PropertyName, e: MouseEvent<HTMLTableCellElement>) => {
    if (activeCell.row === row && activeCell.column === column) {
      if (editable && !activeCell.edited) setActiveCell({row, column, edited: true});
      return;
    }
    let resetSelection = true;

    if (e.ctrlKey) {
      if (selection.has(row)) {
        selection.delete(row);
      } else {
        selection.add(row);
      }
      resetSelection = false;
    }
    else if (e.shiftKey) {
      selection.resetWithAnchor(row);
      resetSelection = false;
    } else {
      selection.setAnchorRow(row);
    }
    setActiveCell({row, column, edited: undefined}, resetSelection);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const isEditing = activeCell.edited;
    const { key, shiftKey, ctrlKey } = event.nativeEvent;

    if (key.startsWith('Arrow')) {
      if (key.endsWith('Up')) {
        event.preventDefault();
        ctrlKey ? actions.moveToFirst() : actions.moveCellVertical(-1, shiftKey);
      }
      else if (key.endsWith('Down')) {
        event.preventDefault();
        ctrlKey ? actions.moveToLast() : actions.moveCellVertical(1, shiftKey);
      }
      else if (key.endsWith('Left')) {
        if (!isEditing) actions.moveCellHorizontal(-1);
      }
      else if (key.endsWith('Right')) {
        if (!isEditing) actions.moveCellHorizontal(1);
      }
    }
    else if (key === 'Enter') {
      if (!editable || activeCell.row === null) return;
      if (isEditing) return actions.endEdit(true);

      selection.reset(activeCell.row);
      state.data.setActiveCell({...activeCell, edited: true});
      updateTableState(state.id);
    }
    else if (key === 'Escape') {
      if (isEditing) {
        actions.endEdit(false);
      } else {
        selection.clear();
        setActiveCell({row: null, column: null, edited: false}, false);
      }
    }
    else if (key === 'Home') {
      if (isEditing) {
        event.preventDefault();
      } else {
        actions.moveCellHorizontal(undefined, 0);
      }
    }
    else if (key === 'End') {
      if (isEditing) {
        event.preventDefault();
      } else {
        actions.moveCellHorizontal(undefined, columns.length - 1);
      }
    }
    else if (key === 'Insert') {
      if (!editable || isEditing || state.data.queryID === null) return;
      actions.addRecord(event.ctrlKey);
    }
    else if (key === 'Delete') {
      if (editable && !selection.empty()) actions.deleteRecords();
    }
    else if (key === 'PageUp') {
      if (ctrlKey) return;
      const row = state.viewport.getPageRow(true);
      if (row !== null) setActiveCell({...activeCell, row});
    }
    else if (key === 'PageDown') {
      if (ctrlKey) return;
      const row = state.viewport.getPageRow(false);
      if (row !== null) setActiveCell({...activeCell, row});
    }
    else if (key === 'Tab') {
      if (activeCell.row === null) return;
      event.preventDefault();
      const currentIndex = columnDict[activeCell.column].columnIndex;

      if (currentIndex === columns.length - 1) {
        setActiveCell({...activeCell, column: columns[0].id});
        actions.moveCellVertical(1);
      } else {
        actions.moveCellHorizontal(1);
      }
    }
    else if (key === 'a' || key === 'A' || key === 'ф' || key === 'Ф') {
      if (!event.ctrlKey || isEditing) return;
      event.preventDefault();
      selection.reset(records.map(r => r.index));
      updateTableState(state.id);
    }
  };

  return (
    <div className={'table-root'} tabIndex={0} onKeyDown={onKeyDown}>
      <TableToolbar state={state} loading={clientLoading?.status === 'data'}/>
      <TableView state={state} query={query}/>
    </div>
  );
};
