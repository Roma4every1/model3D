import { t } from 'shared/locales';
import { createElement } from 'react';
import { showNotification } from 'entities/notification';
import { showWarningMessage, showWindow, closeWindow } from 'entities/window';
import { useObjectsStore } from 'entities/objects';
import { programAPI, watchOperation } from 'entities/program';
import { useChannelStore, reloadChannel, setChannelActiveRow } from 'entities/channel';
import { useParameterStore, findParameters, updateParamDeep, rowToParameterValue } from 'entities/parameter';
import { useClientStore, addSessionClient, setClientActiveChild, setClientLoading, crateAttachedChannel } from 'entities/client';
import { useTableStore } from './table.store';
import { createTableState } from './table.actions';
import { tableStateToSettings } from '../lib/serialization';
import { DetailsTable } from '../components/details-table';


/** Перезагрузка данных канала таблицы. */
export async function reloadTable(id: FormID): Promise<void> {
  setClientLoading(id, 'data');
  const channelID = useTableStore.getState()[id]?.channelID;
  if (!channelID) return;
  await reloadChannel(channelID);
  setClientLoading(id, 'done');
  showNotification(t('table.reload-ok'));
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

export async function exportTableToExcel(id: FormID): Promise<void> {
  const tableState = useTableStore.getState()[id];
  const channel = useChannelStore.getState().storage[tableState.channelID];

  const dto = {
    channelName: channel.name,
    paramName: getTableDisplayName(id) ?? 'Таблица',
    presentationId: useClientStore.getState()[id].parent,
    paramValues: findParameters(channel.config.parameters, useParameterStore.getState().storage),
    settings: tableStateToSettings(id, tableState).columnSettings,
  };
  const res = await programAPI.exportToExcel(dto);
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

export function getTableDisplayName(id: FormID): string | null {
  const clientStates = useClientStore.getState();
  const presentation = clientStates[clientStates[id].parent];

  const formData = presentation.children.find(child => child.id === id);
  const namePattern = formData.displayNameString;

  if (namePattern) {
    const storage = useParameterStore.getState().storage;
    const parameters = findParameters(namePattern.parameterIDs, storage);
    return namePattern.build(parameters);
  }
  return presentation.layout.getNodeById(id)?.getName() ?? null;
}
