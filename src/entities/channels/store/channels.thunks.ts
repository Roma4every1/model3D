import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { channelsAPI } from 'entities/channels/lib/channels.api';
import { fillChannels } from '../lib/utils';
import { setChannelData, setChannelsData } from './channels.actions';


/** Перезагрузить данные каналов. */
export const reloadChannels = (names: ChannelName[]): Thunk => {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const dict: ChannelDict = {};
    const { channels, parameters } = getState();

    names.forEach((name) => { dict[name] = channels[name]; });
    await fillChannels(dict, parameters);

    const entries: ChannelDataEntries = names.map((name) => [name, channels[name].data]);
    dispatch(setChannelsData(entries));
  };
};

/** Перезагрузить данные канала. */
export const reloadChannel = (name: ChannelName): Thunk => {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const { channels, parameters } = getState();
    const dict = {[name]: channels[name]};
    await fillChannels(dict, parameters);

    const { data, tableID } = dict[name];
    dispatch(setChannelData(name, data, tableID));
  };
};

/* --- Table Editing --- */

export const insertRows = (tableID: TableID, rows: ChannelRow[]): Thunk<boolean> => {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const res = await channelsAPI.insertRow(tableID, rows);
    updateTablesByResult(res, tableID, dispatch, getState().channels);
    return res.ok;
  };
};

export const updateRows = (tableID: TableID, ids: number[], rows: ChannelRow[]): Thunk<boolean> => {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const res = await channelsAPI.updateRows(tableID, ids, rows);
    updateTablesByResult(res, tableID, dispatch, getState().channels);
    return res.ok && !res.data.WrongResult;
  };
};

export const deleteRows = (tableID: TableID, ids: number[], all: boolean): Thunk<boolean> => {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const res = await channelsAPI.removeRows(tableID, ids, all);
    updateTablesByResult(res, tableID, dispatch, getState().channels);
    return res.ok && !res.data.WrongResult;
  };
};

const updateTablesByResult = (res: Res<Report>, tableID: TableID, dispatch: any, dict: ChannelDict) => {
  const tables = [tableID];

  if (res.ok && !res.data.WrongResult) {
    tables.push(...res.data.ModifiedTables?.ModifiedTables);
  }

  const channelNames: ChannelName[] = [];
  for (const id of tables) {
    for (const name in dict) {
      const tableID = dict[name].tableID;
      if (tableID === id) channelNames.push(name);
    }
  }
  dispatch(reloadChannels(channelNames));
};
