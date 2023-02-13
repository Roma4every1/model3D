import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { channelsAPI } from 'entities/channels/lib/channels.api';
import { fillChannels } from '../lib/utils';
import { findChannelsByTables } from '../lib/common';
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
  return async (dispatch: Dispatch) => {
    const res = await channelsAPI.insertRow(tableID, rows);
    updateTablesByResult(res, tableID, dispatch);
    return res.ok;
  };
};

export const updateRows = (tableID: TableID, ids: number[], rows: ChannelRow[]): Thunk<boolean> => {
  return async (dispatch: Dispatch) => {
    const res = await channelsAPI.updateRows(tableID, ids, rows);
    updateTablesByResult(res, tableID, dispatch);
    return res.ok && !res.data.WrongResult;
  };
};

export const deleteRows = (tableID: TableID, ids: number[], all: boolean): Thunk<boolean> => {
  return async (dispatch: Dispatch) => {
    const res = await channelsAPI.removeRows(tableID, ids, all);
    updateTablesByResult(res, tableID, dispatch);
    return res.ok && !res.data.WrongResult;
  };
};

const updateTablesByResult = (res: Res<Report>, tableID: TableID, dispatch: Dispatch<any>) => {
  const tables = [tableID];
  if (res.ok && !res.data.WrongResult) {
    tables.push(...res.data.ModifiedTables?.ModifiedTables);
  }
  dispatch(updateTables(tables));
};

export const updateTables = (tables: TableID[]) => {
  return (dispatch: Dispatch<any>, getState: StateGetter) => {
    const state = getState();
    const channelNames = findChannelsByTables(tables, state.channels);
    dispatch(reloadChannels(channelNames));
  };
};
