import type { TableColumnFilter } from '../lib/filter.types';
import { t } from 'shared/locales';
import { createElement } from 'react';
import { watchOperation, programAPI } from 'entities/program';
import { findParameters, updateParamDeep, useParameterStore, rowToParameterValue } from 'entities/parameter';
import { reloadChannelsByQueryIDs, reloadChannel, setChannelActiveRow, channelAPI, useChannelStore } from 'entities/channel';
import { showWarningMessage, showDialog, showWindow, closeWindow } from 'entities/window';
import { showNotification } from 'entities/notification';
import { createTableState } from './table.actions';
import { tableStateToSettings } from '../lib/serialization';
import { applyFilters } from '../lib/filter-utils';
import { DetailsTable } from '../components/details-table';
import { ValidationDialog } from '../components/dialogs/validation';
import { useClientStore, addSessionClient, setClientActiveChild, crateAttachedChannel } from 'entities/client';
import { useObjectsStore } from 'entities/objects';
import { useTableStore } from './table.store';


/** Перезагрузка данных канала таблицы. */
export async function reloadTable(id: FormID): Promise<void> {
  const channelID = useTableStore.getState()[id]?.channelID;
  if (!channelID) return;
  await reloadChannel(channelID);
  showNotification(t('table.reload-ok'));
}

export function setTableColumnFilter(id: FormID, column: PropertyName, filter: TableColumnFilter): Promise<void> {
  const state = useTableStore.getState()[id];
  state.columns.dict[column].filter = filter;

  const columnFilters = [];
  let channelFilter: FilterNode;

  for (const column of state.columns.list) {
    const filter = column.filter;
    if (filter?.node && filter.enabled) columnFilters.push(filter.node);
  }
  if (columnFilters.length > 1) {
    channelFilter = {type: 'and', value: columnFilters};
  } else if (columnFilters.length > 0) {
    channelFilter = columnFilters[0]
  }
  const channel = useChannelStore.getState().storage[state.channelID];
  channel.query.filter = channelFilter;

  useTableStore.setState({[id]: {...state}});
  return reloadChannel(channel.id);
}

export async function applyUploadedFilters(id: FormID, file: File): Promise<void> {
  const warn = (m: string) => showWarningMessage(t(m), t('table.filter.upload-title'));
  const fileContent = await file.text().catch(() => null);
  if (fileContent === null) return warn('table.filter.error-decoding');

  const columns = useTableStore.getState()[id].columns.list;
  const ok = applyFilters(fileContent, columns);
  if (!ok) return warn('table.filter.error-format');

  const mockColumn = columns[0];
  await setTableColumnFilter(id, mockColumn.id, mockColumn.filter);
  showNotification({type: 'success', content: t('table.filter.applied')});
}

/** Обновляет параметр активной строки. */
export async function updateActiveRecord(id: FormID, rowIndex: number | null): Promise<void> {
  const tableState = useTableStore.getState()[id];
  const channel = useChannelStore.getState().storage[tableState.channelID];

  let row: ChannelRow;
  if (rowIndex !== null) row = channel.data.rows[rowIndex];
  setChannelActiveRow(channel.id, row);

  if (tableState.activeRecordParameter) {
    const newValue = row ? rowToParameterValue(row, channel) : null;
    await updateParamDeep(tableState.activeRecordParameter, newValue);
  }
}

/* --- Editing --- */

/**
 * Выход таблицы из режима редактирования.
 * Если `save` равен true, изменения применяются, иначе отменяются.
 */
export async function endTableEditing(id: FormID, save: boolean, cell?: TableActiveCell): Promise<void> {
  const state = useTableStore.getState()[id];
  const { data, selection } = state;
  const { records, activeCell } = data;

  if (activeCell.row === null || activeCell.edited !== true) return;
  const record = records[activeCell.row];
  const isNew = data.isNewRecord(record);

  const hasChanges = isNew || record.initCells;
  if (!cell) cell = {...activeCell, edited: false};
  if (hasChanges) cell.edited = false;

  const update = () => {
    useTableStore.setState({[id]: {...state}});
    if (cell.edited === false) state.viewport.focusRoot();
  };

  if (!save) {
    if (isNew) {
      data.setActiveCell(null);
      data.delete(record.index);
      selection.clear();
    } else {
      data.setActiveCell(cell);
      data.rollbackRecord(record);
    }
    return update();
  }
  if (!hasChanges) {
    data.setActiveCell(cell);
    return update();
  }
  const errors = isNew || data.validateRecord(record);

  if (Array.isArray(errors) && errors.length) {
    const windowID = 'record-validation';
    const onClose = () => { closeWindow(windowID); state.viewport.focusRoot(); }

    const dialogProps = {title: t('table.validation.dialog-title'), minWidth: 320, onClose};
    const contentProps = {errors, columns: state.columns.dict, onClose};
    showDialog(windowID, dialogProps, createElement(ValidationDialog, contentProps));
    useTableStore.setState({[id]: {...state}}); return;
  }
  if (isNew) {
    data.setActiveCell(null);
    selection.clear();
  } else {
    data.setActiveCell(cell);
  }
  data.commitRecord(record);

  update();
  showNotification(t('table.save-start'));

  const res = isNew
    ? await channelAPI.insertRows(data.queryID, [record.cells])
    : await channelAPI.updateRows(data.queryID, [record.index], [record.cells]);

  const error = res.ok ? res.data.error : res.message;
  if (error) {
    showWarningMessage(error);
    return reloadChannel(state.channelID);
  }
  await reloadChannelsByQueryIDs([data.queryID, ...res.data.modifiedTables]);
  showNotification(t('table.save-ok'));
  update();
}

/** Удаление строк таблицы. */
export async function deleteTableRecords(id: FormID, indexes: number[]): Promise<void> {
  if (indexes.length === 0) return;
  const state = useTableStore.getState()[id];
  const queryID = state.data.queryID;
  const res = await channelAPI.removeRows(queryID, indexes);

  const error = res.ok ? res.data.error : res.message;
  if (error) {
    showWarningMessage(error);
    return reloadChannel(state.channelID);
  }

  const activeCell = state.data.activeCell;
  if (indexes.includes(activeCell.row)) {
    state.data.setActiveCell({row: null, column: null, edited: false});
  }
  state.selection.clear();

  await reloadChannelsByQueryIDs([queryID, ...res.data.modifiedTables]);
  showNotification(t('table.delete-ok', {n: indexes.length}));
}

export async function addTableRecord(id: FormID, copy: boolean, index?: number): Promise<void> {
  const state = useTableStore.getState()[id];
  const { data, columns, selection, viewport } = state;

  const res = !copy && await channelAPI.getNewRow(data.queryID);
  if (!copy && res.ok === false) { showWarningMessage(res.message); return; }

  const activeRow = data.activeCell.row;
  if (index === undefined) index = activeRow !== null ? activeRow : 0;
  data.add(index, copy ? [...data.records[index].cells] : res.data);

  const editColumn = data.activeCell.column ?? columns.list[0].id;
  data.setActiveCell({row: index, column: editColumn, edited: true});
  selection.reset(index);
  useTableStore.setState({[id]: {...state}});
  viewport.scrollCellIntoView(index, editColumn);
}

/* --- Other --- */

export async function exportTableToExcel(id: FormID): Promise<void> {
  const tableState = useTableStore.getState()[id];
  const channel = useChannelStore.getState().storage[tableState.channelID];

  const clientStates = useClientStore.getState();
  const parentID = clientStates[id].parent;
  const parentState = clientStates[parentID];

  const exportData = {
    channelName: channel.name,
    paramName: parentState.children.find(child => child.id === id)?.displayName ?? 'Таблица',
    presentationId: parentID,
    paramValues: findParameters(channel.config.parameters, useParameterStore.getState().storage),
    settings: tableStateToSettings(id, tableState).columnSettings,
  };

  const res = await programAPI.exportToExcel(exportData);
  if (res.ok === false) { showWarningMessage(res.message); return; }

  const { operationID, error } = res.data;
  if (error) { showWarningMessage(error); return; }
  if (operationID) await watchOperation(operationID).then();
}

export function showDetailsTable(formID: FormID, columnID: PropertyName): void {
  const tables = useTableStore.getState();
  const detailsTableID = formID + columnID;
  const detailsTableState = tables[detailsTableID];

  const column = tables[formID]?.columns.dict[columnID];
  if (!column || !column.detailChannel) return;

  const channels = useChannelStore.getState().storage;
  const channel = channels[column.detailChannel];
  const displayName = channel.config.displayName ?? channel.name;

  const presentationID = useClientStore.getState().root.activeChildID;
  const presentation = useClientStore.getState()[presentationID];
  const hasFormData = presentation.children.some(c => c.id === detailsTableID);

  if (!hasFormData) {
    const formState: SessionClient = {
      id: detailsTableID, parent: presentationID,
      type: 'dataSet', settings: {}, parameters: [],
      channels: [crateAttachedChannel({name: channel.name}, channel)],
      loading: {status: 'done'},
    };
    presentation.children.push({id: detailsTableID, type: 'dataSet', displayName});
    addSessionClient(formState);
  }

  if (!detailsTableState) createTableState({
    state: useClientStore.getState()[detailsTableID],
    objects: useObjectsStore.getState(),
    parameters: useParameterStore.getState().clients,
    channels: channels,
  });

  const onFocus = () => {
    setClientActiveChild(presentationID, detailsTableID);
  };
  const onClose = () => {
    setClientActiveChild(presentationID, formID);
    closeWindow(detailsTableID);
  };
  const windowProps = {
    className: 'details-table-window', style: {zIndex: 99}, width: 400, height: 300,
    resizable: false, title: displayName, onFocus, onClose,
  };

  const content = createElement(DetailsTable, {id: detailsTableID, onClose});
  showWindow(detailsTableID, windowProps, content);
  setClientActiveChild(presentationID, detailsTableID);
}
