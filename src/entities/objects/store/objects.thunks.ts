import { ParameterUpdateEntries, updateParamDeep, rowToParameterValue } from 'entities/parameter';
import { useChannelStore, reloadChannel, reloadChannelsByQueryIDs, channelAPI } from 'entities/channel';
import { setCurrentTrace } from './objects.actions';
import { useObjectsStore } from './objects.store';


/** По данным обновления параметров обновляет активные объекты. */
export function updateObjects(entries: ParameterUpdateEntries): void {
  const channels = useChannelStore.getState();
  const { place, stratum, well, trace } = useObjectsStore.getState();

  const placeChanged = place.activated() && place.onParameterUpdate(entries);
  const stratumChanged = stratum.activated() && stratum.onParameterUpdate(entries);
  const wellChanged = well.activated() && well.onParameterUpdate(entries);
  const traceChanged = trace.activated() && trace.onParameterUpdate(entries, channels);

  if (placeChanged || stratumChanged || wellChanged || traceChanged) {
    useObjectsStore.setState({place, stratum, well, trace}, true);
  }
}

/** Обновление параметры скважины. */
export async function setCurrentWell(id: WellID): Promise<void> {
  const { channelName, parameterID, model } = useObjectsStore.getState().well;
  if (model && model.id === id) return;
  const wellChannel = useChannelStore.getState()[channelName];

  const idIndex = wellChannel.config.lookupColumns.id.columnIndex;
  const row = wellChannel.data?.rows.find(r => r[idIndex] === id);
  if (!row) return;

  const rowValue = rowToParameterValue(row, wellChannel);
  await updateParamDeep('root', parameterID, rowValue);
}

/** Создание новой трассы. */
export async function createTrace(model: TraceModel): Promise<void> {
  const traceManager = useObjectsStore.getState().trace;
  const traceChannel = useChannelStore.getState()[traceManager.channelName];
  const traceQueryID = traceChannel.data.queryID;

  const { ok, data: newRow } = await channelAPI.getNewRow(traceQueryID);
  if (!ok) return;

  // id новой трассы берётся из newRow
  model.id = newRow[traceChannel.config.lookupColumns.id.columnIndex];
  traceManager.model = model;
  traceManager.applyModelToChannelRow(traceChannel, newRow);

  await channelAPI.insertRows(traceQueryID, [newRow]).then();
  await reloadChannel(traceChannel.name);

  const value = rowToParameterValue(newRow, traceChannel);
  await updateParamDeep('root', traceManager.parameterID, value);
  setCurrentTrace(model, true, true);
}

/** Сохранение изменений трассы. */
export async function saveTrace(): Promise<void> {
  const traceManager = useObjectsStore.getState().trace;
  const { model, channelName, nodeChannelName, parameterID } = traceManager;
  const traceChannel = useChannelStore.getState()[channelName];
  const traceData = traceChannel.data;

  const idIndex = traceChannel.config.lookupColumns.id.columnIndex;
  const index = traceData.rows.findIndex(row => row[idIndex] === model.id);
  const row = traceData.rows[index];
  traceManager.applyModelToChannelRow(traceChannel, row);

  await channelAPI.updateRows(traceData.queryID, [index], [row]);
  await reloadChannel(traceChannel.name);

  if (traceManager.nodesChanged()) {
    const nodeChannel = useChannelStore.getState()[nodeChannelName];
    const queryID = nodeChannel.data.queryID;

    const nodeRows = traceManager.getNodeChannelRows(nodeChannel.data.columns);
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
  const traceManager = useObjectsStore.getState().trace;
  const traceData = channels[traceManager.channelName].data;

  const traceQueryID = traceData.queryID;
  const nodesQueryID = channels[traceManager.nodeChannelName].data.queryID;

  const rowIndex = traceData.rows.findIndex(row => row[0] === traceManager.model.id);
  if (rowIndex === -1) return;

  await Promise.all([
    channelAPI.removeRows(traceQueryID, [rowIndex]).then(),
    channelAPI.removeRows(nodesQueryID, 'all').then(),
  ]);

  await reloadChannelsByQueryIDs([traceQueryID, nodesQueryID]);
  await updateParamDeep('root', traceManager.parameterID, null);
  setCurrentTrace(undefined, false, false);
}
