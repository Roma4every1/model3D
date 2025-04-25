import { showWarningMessage } from 'entities/window';
import { updateParamDeep, rowToParameterValue } from 'entities/parameter';
import { useChannelStore, channelAPI, reloadChannel, reloadChannels } from 'entities/channel';
import { useObjectsStore } from './objects.store';
import { setCurrentTrace } from './objects.actions';


/** Создание новой трассы. */
export async function createTrace(): Promise<void> {
  const traceManager = useObjectsStore.getState().trace;
  const traceChannel = useChannelStore.getState().storage[traceManager.channelID];
  const traceQueryID = traceChannel.data.queryID;

  const { ok, data: newRow } = await channelAPI.getNewRow(traceQueryID);
  if (!ok) return;

  const newTraceID = newRow[traceChannel.config.lookupColumns.id.columnIndex];
  const model: TraceModel = {id: newTraceID, name: '', nodes: []};
  traceManager.model = model;
  traceManager.applyModelToChannelRow(traceChannel, newRow);

  await channelAPI.insertRows(traceQueryID, [newRow]);
  await reloadChannel(traceChannel.id);

  const value = rowToParameterValue(newRow, traceChannel);
  await updateParamDeep(traceManager.parameterID, value);
  setCurrentTrace(model, true, true);
}

/** Сохранение изменений трассы. */
export async function saveTrace(): Promise<void> {
  const traceManager = useObjectsStore.getState().trace;
  const { model, channelID, nodeChannelID, parameterID } = traceManager;
  const error = validateTrace(model);
  if (error) { showWarningMessage(error); return; }

  const traceChannel = useChannelStore.getState().storage[channelID];
  const idIndex = traceChannel.config.lookupColumns.id.columnIndex;
  const index = traceChannel.data.rows.findIndex(row => row[idIndex] === model.id);
  const row = traceChannel.data.rows[index];

  traceManager.applyModelToChannelRow(traceChannel, row);
  await channelAPI.updateRows(traceChannel.data.queryID, [index], [row]);

  if (traceManager.nodesChanged()) {
    const nodeChannel = useChannelStore.getState().storage[nodeChannelID];
    const queryID = nodeChannel.data.queryID;

    const { data: templateRow } = await channelAPI.getNewRow(queryID);
    const nodeRows = traceManager.getNodeChannelRows(templateRow, nodeChannel.data.columns);

    await channelAPI.removeRows(queryID, 'all');
    await channelAPI.insertRows(queryID, nodeRows).then();
    await reloadChannel(nodeChannel.id);
  }

  await reloadChannel(traceChannel.id);
  const updatedData = useChannelStore.getState().storage[traceChannel.id].data;
  const updatedRow = updatedData?.rows.find(r => r[idIndex] === model.id);

  await updateParamDeep(parameterID, rowToParameterValue(updatedRow, traceChannel));
  setCurrentTrace(undefined, false, false);
}

/** Удаление трассы. */
export async function deleteTrace(): Promise<void> {
  const channels = useChannelStore.getState().storage;
  const traceManager = useObjectsStore.getState().trace;
  const traceData = channels[traceManager.channelID].data;

  const traceQueryID = traceData.queryID;
  const nodesQueryID = channels[traceManager.nodeChannelID].data.queryID;

  const rowIndex = traceData.rows.findIndex(row => row[0] === traceManager.model.id);
  if (rowIndex === -1) return;

  await channelAPI.removeRows(nodesQueryID, 'all');
  await channelAPI.removeRows(traceQueryID, [rowIndex]);

  await reloadChannels(traceManager.channelID, traceManager.nodeChannelID);
  await updateParamDeep(traceManager.parameterID, null);
  setCurrentTrace(undefined, false, false);
}

function validateTrace(trace: TraceModel): string {
  let invalidNodes: TraceNode[] = [];
  for (const node of trace.nodes) {
    const id = node.id;
    if (id === undefined || Number.isNaN(id)) invalidNodes.push(node);
  }
  let message: string;
  if (invalidNodes.length > 1) {
    message = `для скважин ${invalidNodes.map(n => n.name).join(', ')} неопределены идентификаторы`;
  } else if (invalidNodes.length > 0) {
    message = `для скважины ${invalidNodes[0].name} неопределён идентификатор.`;
  } else {
    return null;
  }
  return 'Трасса не может быть сохранена: ' + message;
}
