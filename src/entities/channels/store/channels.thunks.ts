import { Dispatch } from 'redux';
import { Thunk, StateGetter } from 'shared/lib';
import { fillChannel, fillChannels } from '../lib/utils';
import { findChannelsByTables } from '../lib/common';
import { setChannelData, setChannelsData } from './channels.actions';
import { setChannelSortOrder, setChannelMaxRowCount } from './channels.actions';


/** Перезагрузить данные каналов. */
export function reloadChannels(names: ChannelName[]): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const dict: ChannelDict = {};
    const { channels, parameters } = getState();

    names.forEach((name) => { dict[name] = channels[name]; });
    await fillChannels(dict, parameters);

    const entries: ChannelDataEntries = names.map((name) => [name, channels[name].data]);
    dispatch(setChannelsData(entries));
  };
}

/** Перезагрузить данные канала. */
export function reloadChannel(channelName: ChannelName): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    const { channels, parameters } = getState();
    await fillChannel(channels[channelName], parameters);
    const { data, tableID } = channels[channelName];
    dispatch(setChannelData(channelName, data, tableID));
  };
}

/** Обновляет порядок сортировки и перезагружает канал. */
export function updateSortOrder(channelName: ChannelName, order: SortOrder): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    dispatch(setChannelSortOrder(channelName, order));
    await reloadChannel(channelName)(dispatch, getState);
  };
}

/** Обновляет ограничитель количества строк и перезагружает канал. */
export function updateMaxRowCount(channelName: ChannelName, count: number): Thunk {
  return async (dispatch: Dispatch, getState: StateGetter) => {
    dispatch(setChannelMaxRowCount(channelName, count));
    await reloadChannel(channelName)(dispatch, getState);
  };
}

/** Перезагрузить данные каналов по ID таблиц. */
export function updateTables(tables: TableID[]) {
  return async (dispatch: Dispatch<any>, getState: StateGetter) => {
    const state = getState();
    const channelNames = findChannelsByTables(tables, state.channels);
    await reloadChannels(channelNames)(dispatch, () => state);
  };
}
