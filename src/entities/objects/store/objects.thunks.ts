import { updateParamDeep, rowToParameterValue } from 'entities/parameter';
import { useChannelStore, reloadChannel, reloadChannelsByQueryIDs, channelAPI } from 'entities/channel';
import { applyModelToRow, isNodesEqual, traceToNodeChannelRows } from '../lib/common';
import { setCurrentTrace } from './objects.actions';
import { useObjectsStore } from './objects.store';


/** Обновление параметры скважины. */
export async function setCurrentWell(id: WellID): Promise<void> {
  const { channelName, parameterID, model } = useObjectsStore.getState().well;
  if (model && model.id === id) return;
  const wellChannel = useChannelStore.getState()[channelName];

  const idIndex = wellChannel.info.lookupColumns.id.index;
  const row = wellChannel.data?.rows.find(r => r[idIndex] === id);
  if (!row) return;

  const rowValue = rowToParameterValue(row, wellChannel);
  await updateParamDeep('root', parameterID, rowValue);
}

/** Создание новой трассы. */
export async function createTrace(model: TraceModel): Promise<void> {
  const { channelName, parameterID } = useObjectsStore.getState().trace;
  const traceChannel = useChannelStore.getState()[channelName];
  const traceQueryID = traceChannel.data.queryID;

  const { ok, data: newRow } = await channelAPI.getNewRow(traceQueryID);
  if (!ok) return;

  // id новой трассы берётся из newRow
  model.id = newRow[traceChannel.info.columns.id.index];
  applyModelToRow(traceChannel, newRow, model);

  await channelAPI.insertRows(traceQueryID, [newRow]).then();
  await reloadChannel(traceChannel.name);

  const rowValue = rowToParameterValue(newRow, traceChannel);
  await updateParamDeep('root', parameterID, rowValue);
  setCurrentTrace(model, true, true);
}

/** Сохранение изменений трассы. */
export async function saveTrace(): Promise<void> {
  const { model, oldModel, channelName, parameterID } = useObjectsStore.getState().trace;
  const traceChannel = useChannelStore.getState()[channelName];
  const traceData = traceChannel.data;

  const idIndex = traceChannel.info.columns.id.index;
  const index = traceData.rows.findIndex(row => row[idIndex] === model.id);
  const row = traceData.rows[index];
  applyModelToRow(traceChannel, row, model);

  await channelAPI.updateRows(traceData.queryID, [index], [row]);
  await reloadChannel(traceChannel.name);

  if (!isNodesEqual(oldModel?.nodes ?? [], model.nodes)) {
    const objects = useObjectsStore.getState();
    const nodeChannel = useChannelStore.getState()[objects.trace.nodeChannelName];
    const queryID = nodeChannel.data.queryID;

    const nodeRows = traceToNodeChannelRows(nodeChannel, objects.trace.model);
    await channelAPI.removeRows(queryID, 'all');
    await channelAPI.insertRows(queryID, nodeRows).then();
    await reloadChannel(nodeChannel.name);
  }

  const rowValue = rowToParameterValue(row, traceChannel);
  await updateParamDeep('root', parameterID, rowValue);
  setCurrentTrace(undefined, false, false);
}

/** Удаление трассы. */
export async function deleteTrace(): Promise<void> {
  const channels = useChannelStore.getState();
  const objects = useObjectsStore.getState();
  const traceState = objects.trace;
  const traceData = channels[traceState.channelName].data;

  const traceQueryID = traceData.queryID;
  const nodesQueryID = channels[traceState.nodeChannelName].data.queryID;

  const rowIndex = traceData.rows.findIndex(row => row[0] === traceState.model.id);
  if (rowIndex === -1) return;

  await Promise.all([
    channelAPI.removeRows(traceQueryID, [rowIndex]).then(),
    channelAPI.removeRows(nodesQueryID, 'all').then(),
  ]);

  await reloadChannelsByQueryIDs([traceQueryID, nodesQueryID]);
  await updateParamDeep('root', traceState.parameterID, null);
  setCurrentTrace(undefined, false, false);
}
