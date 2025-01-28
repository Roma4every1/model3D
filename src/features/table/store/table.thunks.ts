import { t } from 'shared/locales';
import { createElement } from 'react';
import { showNotification } from 'entities/notification';
import { showWindow, closeWindow } from 'entities/window';
import { useObjectsStore } from 'entities/objects';
import { useProgramStore, setOperationStatus } from 'entities/program';
import { useChannelStore, reloadChannel, setChannelActiveRow, channelAPI } from 'entities/channel';
import { useParameterStore, findParameters, updateParamDeep, rowToParameterValue } from 'entities/parameter';
import { useClientStore, addSessionClient, setClientActiveChild, setClientLoading, crateAttachedChannel } from 'entities/client';
import { useTableStore } from './table.store';
import { createTableState } from './table.actions';
import { DetailsTable } from '../components/details-table';
import { TableExcelCreator } from '../lib/table-export';
import { mimeTypeDict } from 'features/file/lib/constants';


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

export async function exportTableToExcel(formID: FormID): Promise<void> {
  const parentID = useClientStore.getState()[formID].parent;
  const operationID = `${formID}-${Date.now()}`;

  setOperationStatus({
    id: operationID, clientID: parentID, progress: 0, queueNumber: '0',
    timestamp: new Date(), defaultResult: t('base.loading'),
  });
  useProgramStore.getState().layoutController.showTab('right-dock', 0, true);

  const state = useTableStore.getState()[formID];
  const channel = useChannelStore.getState().storage[state.channelID];
  const parameterStorage = useParameterStore.getState().storage;
  const parameters = findParameters(channel.config.parameters, parameterStorage);

  const res = await channelAPI.getChannelData(channel.name, parameters, {
    limit: false,
    order: channel.query.order,
    filter: channel.query.filter,
  });
  if (res.ok === false) {
    const error = res.message;
    return setOperationStatus({id: operationID, defaultResult: t('base.error'), error});
  }

  const extension = 'xlsx';
  const displayName = getTableDisplayName(formID) ?? 'Таблица';
  const date = new Date().toLocaleString('ru').replace(',', '').replaceAll(':','-');
  const fileName = `${displayName}_${date}.${extension}`;

  const excelCreator = new TableExcelCreator(state);
  const workbook = excelCreator.createWorkbook(displayName, res.data.rows);
  const buffer = await workbook.xlsx.writeBuffer();

  const operationFile: OperationFile = {
    name: fileName, extension, type: mimeTypeDict[extension],
    path: '', blob: new Blob([buffer], {type: mimeTypeDict[extension]}),
  };
  setOperationStatus({
    id: operationID, progress: 100,
    file: operationFile, defaultResult: 'Загрузка завершена',
  });
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
