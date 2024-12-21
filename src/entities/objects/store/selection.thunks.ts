import { rowToParameterValue, updateParamDeep } from 'entities/parameter';
import { useChannelStore, channelAPI, reloadChannel, reloadChannels } from 'entities/channel';
import { useObjectsStore } from './objects.store';
import { setSelectionState } from './selection.actions';


export async function createSelection(): Promise<void> {
  const manager = useObjectsStore.getState().selection;
  const channel = useChannelStore.getState().storage[manager.channelID];

  const queryID = channel.data?.queryID;
  if (!queryID) return;
  const { ok, data: newRow } = await channelAPI.getNewRow(queryID);
  if (!ok) return;

  const idIndex = channel.data.columns.findIndex(c => c.name === manager.info.id.columnName);
  const id = newRow[idIndex];
  if (id === null || id === undefined) return;

  const model: SelectionModel = {id, name: '', items: []};
  const nameIndex = channel.data.columns.findIndex(c => c.name === manager.info.name.columnName);
  newRow[nameIndex] = model.name;

  await channelAPI.insertRows(queryID, [newRow]);
  await reloadChannel(channel.id);
  await updateParamDeep(manager.parameterID, rowToParameterValue(newRow, channel));
}

export async function saveSelection(): Promise<void> {
  const manager = useObjectsStore.getState().selection;
  const model = manager.state.model;

  const channel = useChannelStore.getState().storage[manager.channelID];
  const idIndex = channel.data.columns.findIndex(c => c.name === manager.info.id.columnName);
  const rowIndex = channel.data.rows.findIndex(row => row[idIndex] === model.id);

  const row = channel.data.rows[rowIndex];
  manager.applyModelToChannelRow(channel, row);
  await channelAPI.updateRows(channel.data.queryID, [rowIndex], [row]);

  const itemChannel = useChannelStore.getState().storage[manager.itemChannelID];
  const itemQueryID = itemChannel.data.queryID;
  const { data: templateRow } = await channelAPI.getNewRow(itemQueryID);

  const itemRows = manager.getItemRows(templateRow, itemChannel.data.columns);
  await channelAPI.removeRows(itemQueryID, 'all');
  await channelAPI.insertRows(itemQueryID, itemRows);

  await reloadChannels(channel.id, itemChannel.id);
  const updatedData = useChannelStore.getState().storage[channel.id].data;
  const updatedRow = updatedData.rows.find(r => r[idIndex] === model.id);
  await updateParamDeep(manager.parameterID, rowToParameterValue(updatedRow, channel));
  setSelectionState({initModel: null, editing: false});
}

export async function deleteSelection(): Promise<void> {
  const manager = useObjectsStore.getState().selection;
  const channels = useChannelStore.getState().storage;

  // этот код технически правильный, но не работает из-за бага на стороне серверной части
  // --- --- ---
  // const data = channels[manager.channelID].data;
  // const itemData = channels[manager.itemChannelID].data;
  //
  // const idIndex = data.columns.findIndex(c => c.name === manager.info.id.columnName);
  // const rowIndex = data.rows.findIndex(row => row[idIndex] === manager.state.model.id);
  // if (rowIndex === -1) return;
  //
  // await channelAPI.removeRows(itemData.queryID, 'all');
  // await channelAPI.removeRows(data.queryID, [rowIndex]);
  // --- --- ---

  // этот код выполняет больше действий, но обходит серверный баг
  // --- --- ---
  await channelAPI.removeRows(channels[manager.itemChannelID].data.queryID, 'all');
  await reloadChannel(manager.channelID);
  const data = channels[manager.channelID].data;

  const idIndex = data.columns.findIndex(c => c.name === manager.info.id.columnName);
  const rowIndex = data.rows.findIndex(row => row[idIndex] === manager.state.model.id);
  await channelAPI.removeRows(data.queryID, [rowIndex]);
  // --- --- ---

  await reloadChannels(manager.channelID, manager.itemChannelID);
  await updateParamDeep(manager.parameterID, null);
  setSelectionState({initModel: null, editing: false});
}
