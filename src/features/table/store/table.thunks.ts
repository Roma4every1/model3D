import type { Res } from 'shared/lib';
import type { TableFormSettings, SaveTableMetadata, SetRecords } from '../lib/types';
import { t } from 'shared/locales';
import { createElement } from 'react';
import { watchOperation } from 'entities/report';
import { fillParamValues, updateParamDeep, useParameterStore, rowToParameterValue } from 'entities/parameter';
import { reloadChannelsByQueryIDs, reloadChannel, setChannelActiveRow, channelAPI, useChannelStore } from 'entities/channel';
import { showWarningMessage, showWindow, closeWindow } from 'entities/window';
import { showNotification } from 'entities/notification';
import { reportsAPI } from 'entities/report/lib/report.api';
import { createTableState, startTableEditing } from './table.actions';
import { tableStateToSettings } from '../lib/table-settings';
import { LinkedTable } from '../components/table/linked-table';
import { setActiveForm } from 'widgets/presentation';

import { useClientStore, addSessionClient, crateAttachedChannel } from 'entities/client';
import { useObjectsStore } from 'entities/objects';
import { usePresentationStore } from 'widgets/presentation';
import { useTableStore } from './table.store';
import { useRootStore } from '../../../app/store/root-form.store';


/** Перезагрузка данных канала таблицы. */
export async function reloadTable(id: FormID): Promise<void> {
  const channelName = useTableStore.getState()[id]?.channelName;
  if (!channelName) return;
  await reloadChannel(channelName);
  showNotification(t('table.reload.end-ok'));
}

/** Обновляет параметр активной строки. */
export async function updateActiveRecord(id: FormID, recordID: TableRecordID): Promise<void> {
  const tableState = useTableStore.getState()[id];
  const channel = useChannelStore.getState()[tableState.channelName];
  const row = channel.data.rows[recordID];
  setChannelActiveRow(channel.name, row);

  if (tableState.activeRecordParameter) {
    const { id: parameterID, clientID } = tableState.activeRecordParameter;
    const newValue = rowToParameterValue(row, channel);
    await updateParamDeep(clientID, parameterID, newValue);
  }
}

/** Сохранение состояния строк таблицы в базу данных. */
export async function saveTableRecord({type, formID, rowID, row}: SaveTableMetadata): Promise<void> {
  showNotification(t('table.save.start'));
  const queryID = useTableStore.getState()[formID].queryID;
  let res: Res<OperationData>;

  if (type === 'insert') {
    res = await channelAPI.insertRows(queryID, [row]);
  } else {
    res = await channelAPI.updateRows(queryID, [rowID], [row]);
  }

  let error: string;
  const queryIDs: QueryID[] = [queryID];

  if (res.ok === false) {
    error = res.message;
  } else if (res.data.error) {
    error = res.data.error;
  } else {
    queryIDs.push(...res.data.modifiedTables);
  }
  if (error) showWarningMessage(error);

  await reloadChannelsByQueryIDs(queryIDs);
  const text = t('table.save.' + (error ? 'end-error' : 'end-ok'));
  showNotification(text);
}

/** Удаление строк таблицы. */
export async function deleteTableRecords(formID: FormID, indexes: number[] | 'all'): Promise<void> {
  if (Array.isArray(indexes) && indexes.length === 0) return;
  const tableState = useTableStore.getState()[formID];
  const res = await channelAPI.removeRows(tableState.queryID, indexes);

  if (res.ok === false) { showWarningMessage(res.message); return; }
  if (res.data.error) { showWarningMessage(res.data.error); return; }

  const activeCell = tableState.activeCell;
  if (activeCell.recordID && (indexes === 'all' || indexes.includes(activeCell.recordID))) {
    if (activeCell.edited) tableState.edit = {isNew: false, modified: false};
    tableState.activeCell = {columnID: null, recordID: null, edited: false};
  }
  tableState.selection = {};

  const tables = [tableState.queryID, ...res.data.modifiedTables];
  await reloadChannelsByQueryIDs(tables);
  const text = t('table.delete-dialog.delete-ok', {n: indexes.length});
  showNotification(text);
}

export async function getNewRow (
  id: FormID, state: TableState, setRecords: SetRecords,
  copy: boolean, index?: number,
): Promise<void> {
  const res = !copy && await channelAPI.getNewRow(state.queryID);
  if (!copy && res.ok === false) { showWarningMessage(res.message); return; }

  const newID = state.total;
  const activeRecordID = state.activeCell.recordID;

  setRecords((records) => {
    if (index === undefined) {
      index = activeRecordID ? records.findIndex(rec => rec.id === activeRecordID) : 0;
    }
    const cells = copy ? records[index].cells : res.data;
    const record = state.recordHandler.createRecord(newID, cells);
    records.splice(index, 0, record);
    return [...records];
  });

  const editColumnID = state.activeCell.columnID ?? state.columnTreeFlatten[0];
  startTableEditing(id, editColumnID, newID, true);
}

export async function exportTableToExcel(id: FormID): Promise<void> {
  const tableState = useTableStore.getState()[id];
  const config = useChannelStore.getState()[tableState.channelName].config;

  const parentID = useClientStore.getState()[id].parent;
  const parentState = usePresentationStore.getState()[parentID];

  const exportData = {
    channelName: tableState.channelName,
    paramName: parentState.children.find(child => child.id === id)?.displayName ?? 'Таблица',
    presentationId: parentID,
    paramValues: fillParamValues(config.parameters, useParameterStore.getState(), config.clients),
    settings: tableStateToSettings(id, tableState).columnSettings,
  };

  const res = await reportsAPI.exportToExcel(exportData);
  if (res.ok === false) { showWarningMessage(res.message); return; }

  const { operationID, error } = res.data;
  if (error) { showWarningMessage(error); return; }
  if (operationID) await watchOperation(null, operationID).then();
}

export function showLinkedTable(formID: FormID, columnID: TableColumnID): void {
  const channels = useChannelStore.getState();
  const tables = useTableStore.getState();

  const linkedTableID = formID + columnID;
  const rootTableState = tables[formID];
  const linkedTableState = tables[linkedTableID];

  const property = rootTableState?.properties.find(p => p.name === columnID);
  if (!property || !property.detailChannel) return;

  const channel = channels[property.detailChannel];
  const displayName = channel.config.displayName ?? channel.name;

  const presentationID = useRootStore.getState().activeChildID;
  const presentation = usePresentationStore.getState()[presentationID];
  const hasFormData = presentation.children.some(c => c.id === linkedTableID);

  if (!hasFormData) {
    const formState: SessionClient = {
      id: linkedTableID, parent: presentationID,
      type: 'dataSet', settings: null,
      channels: [crateAttachedChannel({name: channel.name}, channel)],
    };
    presentation.children.push({id: linkedTableID, type: 'dataSet', displayName});
    addSessionClient(formState);
  }
  if (!linkedTableState) {
    const payload: FormStatePayload<TableFormSettings> = {
      state: useClientStore.getState()[linkedTableID],
      settings: {id: linkedTableID},
      objects: useObjectsStore.getState(),
      parameters: useParameterStore.getState(),
      channels: channels,
    };
    createTableState(payload);
  }

  const onFocus = () => {
    setActiveForm(presentationID, linkedTableID);
  };
  const onClose = () => {
    setActiveForm(presentationID, formID);
    closeWindow(linkedTableID);
  };
  const windowProps = {
    className: 'linked-table-window', style: {zIndex: 99}, width: 400, height: 300,
    resizable: false, title: displayName, onFocus, onClose,
  };

  const content = createElement(LinkedTable, {id: linkedTableID, onClose});
  showWindow(linkedTableID, windowProps, content);
  setActiveForm(presentationID, linkedTableID);
}
