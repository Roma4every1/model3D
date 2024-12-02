import { useParameterStore, updateParamDeep, rowToParameterValue } from 'entities/parameter';
import { useChannelStore, reloadChannel, reloadChannelsByQueryIDs, channelAPI } from 'entities/channel';
import { setCurrentTrace } from './objects.actions';
import { useObjectsStore } from './objects.store';


/** По данным обновления параметров обновляет активные объекты. */
export function updateObjects(changes: Set<ParameterID>): void {
  let changed = false;
  let { place, stratum, well, trace } = useObjectsStore.getState();
  const storage = useParameterStore.getState().storage;

  if (place.activated() && changes.has(place.parameterID)) {
    const value = storage.get(place.parameterID).getValue();
    if (place.onParameterUpdate(value)) changed = true;
  }
  if (stratum.activated() && changes.has(stratum.parameterID)) {
    const value = storage.get(stratum.parameterID).getValue();
    if (stratum.onParameterUpdate(value)) changed = true;
  }
  if (well.activated() && changes.has(well.parameterID)) {
    const value = storage.get(well.parameterID).getValue();
    if (well.onParameterUpdate(value)) changed = true;
  }
  if (trace.activated() && changes.has(trace.parameterID)) {
    const value = storage.get(trace.parameterID).getValue();
    const channels = useChannelStore.getState().storage;
    if (trace.onParameterUpdate(value, channels)) { trace = trace.clone(); changed = true; }
  }
  if (changed) {
    useObjectsStore.setState({place, stratum, well, trace}, true);
  }
}

/** Обновление параметры скважины. */
export async function setCurrentWell(id: WellID): Promise<void> {
  const { channelID, parameterID, model } = useObjectsStore.getState().well;
  if (model && model.id === id) return;
  const wellChannel = useChannelStore.getState().storage[channelID];

  const idIndex = wellChannel.config.lookupColumns.id.columnIndex;
  const row = wellChannel.data?.rows.find(r => r[idIndex] === id);
  if (!row) return;

  const rowValue = rowToParameterValue(row, wellChannel);
  return updateParamDeep(parameterID, rowValue);
}

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

  await channelAPI.insertRows(traceQueryID, [newRow]).then();
  await reloadChannel(traceChannel.id);

  const value = rowToParameterValue(newRow, traceChannel);
  await updateParamDeep(traceManager.parameterID, value);
  setCurrentTrace(model, true, true);
}

/** Сохранение изменений трассы. */
export async function saveTrace(): Promise<void> {
  const traceManager = useObjectsStore.getState().trace;
  const { model, channelID, nodeChannelID, parameterID } = traceManager;
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

  await reloadChannelsByQueryIDs([traceQueryID, nodesQueryID]);
  await updateParamDeep(traceManager.parameterID, null);
  setCurrentTrace(undefined, false, false);
}
