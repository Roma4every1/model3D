import { updateParamDeep, rowToParameterValue } from 'entities/parameter';
import { useChannelStore, channelAPI, reloadChannel, reloadChannels } from 'entities/channel';
import { useObjectsStore } from './objects.store';
import { setSiteState } from './objects.actions';


export async function createSite(): Promise<void> {
  const manager = useObjectsStore.getState().site;
  const channel = useChannelStore.getState().storage[manager.channelID];

  const queryID = channel.data?.queryID;
  if (!queryID) return;
  const { ok, data: newRow } = await channelAPI.getNewRow(queryID);
  if (!ok) return;

  const idIndex = channel.data.columns.findIndex(c => c.name === manager.info.id.columnName);
  const id = newRow[idIndex];
  if (id === null || id === undefined) return;

  const model: SiteModel = {id, name: 'Участок ' + id, points: []};
  const nameIndex = channel.data.columns.findIndex(c => c.name === manager.info.name.columnName);
  newRow[nameIndex] = model.name;

  await channelAPI.insertRows(queryID, [newRow]);
  await reloadChannel(channel.id);
  await updateParamDeep(manager.parameterID, rowToParameterValue(newRow, channel));
  setSiteState({initModel: null, editMode: 'site-append-point'});
}

export async function saveSite(): Promise<void> {
  const manager = useObjectsStore.getState().site;
  const model = manager.state.model;

  const channel = useChannelStore.getState().storage[manager.channelID];
  const idIndex = channel.data.columns.findIndex(c => c.name === manager.info.id.columnName);
  const rowIndex = channel.data.rows.findIndex(row => row[idIndex] === model.id);
  const row = channel.data.rows[rowIndex];

  manager.applyModelToChannelRow(channel, row);
  await channelAPI.updateRows(channel.data.queryID, [rowIndex], [row]);

  if (manager.pointChanged()) {
    const pointChannel = useChannelStore.getState().storage[manager.pointChannelID];
    const queryID = pointChannel.data.queryID;

    const { data: templateRow } = await channelAPI.getNewRow(queryID);
    const nodeRows = manager.getPointRows(templateRow, pointChannel.data.columns);

    await channelAPI.removeRows(queryID, 'all');
    await channelAPI.insertRows(queryID, nodeRows);
    await reloadChannel(pointChannel.id);
  }

  await reloadChannel(channel.id);
  const updatedData = useChannelStore.getState().storage[channel.id].data;
  const updatedRow = updatedData.rows.find(r => r[idIndex] === model.id);
  await updateParamDeep(manager.parameterID, rowToParameterValue(updatedRow, channel));
  setSiteState({initModel: null, editMode: null});
}

export async function deleteSite(): Promise<void> {
  const manager = useObjectsStore.getState().site;
  const channels = useChannelStore.getState().storage;

  const siteData = channels[manager.channelID].data;
  const pointData = channels[manager.pointChannelID].data;

  const idIndex = siteData.columns.findIndex(c => c.name === manager.info.id.columnName);
  const rowIndex = siteData.rows.findIndex(row => row[idIndex] === manager.state.model.id);
  if (rowIndex === -1) return;

  await channelAPI.removeRows(pointData.queryID, 'all');
  await channelAPI.removeRows(siteData.queryID, [rowIndex]);

  await reloadChannels(manager.channelID, manager.pointChannelID);
  await updateParamDeep(manager.parameterID, null);
  setSiteState({initModel: null, editMode: null});
}
