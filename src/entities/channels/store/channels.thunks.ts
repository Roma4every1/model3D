import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
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

/** Перезагрузить данные каналов по ID таблиц. */
export const updateTables = (tables: TableID[]) => {
  return async (dispatch: Dispatch<any>, getState: StateGetter) => {
    const state = getState();
    const channelNames = findChannelsByTables(tables, state.channels);
    await dispatch(reloadChannels(channelNames));
  };
};
