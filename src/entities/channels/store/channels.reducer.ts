/* --- Action Types --- */

export enum ChannelActionType {
  SET_CHANNELS = 'channel/sets',
  SET_CHANNEL_DATA = 'channel/datum',
  SET_CHANNELS_DATA = 'channel/data',
  SET_SORT_ORDER = 'channel/order',
  SET_MAX_ROW_COUNT = 'channel/count',
  SET_ACTIVE_ROW = 'channel/active',
}

/* --- Action Interfaces --- */

interface ActionSetChannels {
  type: ChannelActionType.SET_CHANNELS;
  payload: ChannelDict;
}
interface ActionSetChannelData {
  type: ChannelActionType.SET_CHANNEL_DATA;
  payload: {name: ChannelName, data: ChannelData, tableID: TableID};
}
interface ActionSetChannelsData {
  type: ChannelActionType.SET_CHANNELS_DATA;
  payload: ChannelDataEntries;
}
interface ActionSetSortOrder {
  type: ChannelActionType.SET_SORT_ORDER;
  payload: {name: ChannelName, order: SortOrder};
}
interface ActionSetMaxRowCount {
  type: ChannelActionType.SET_MAX_ROW_COUNT;
  payload: {name: ChannelName, count: number | null};
}
interface ActionSetActiveRow {
  type: ChannelActionType.SET_ACTIVE_ROW;
  payload: {name: ChannelName, row: ChannelRow};
}

export type ChannelAction = ActionSetChannels | ActionSetChannelData | ActionSetChannelsData |
  ActionSetSortOrder | ActionSetMaxRowCount | ActionSetActiveRow;

/* --- Init State & Reducer --- */

const init: ChannelDict = {};

export function channelsReducer(state: ChannelDict = init, action: ChannelAction): ChannelDict {
  switch (action.type) {

    case ChannelActionType.SET_CHANNELS: {
      return {...state, ...action.payload};
    }

    case ChannelActionType.SET_CHANNEL_DATA: {
      const { name, data, tableID } = action.payload;
      return {...state, [name]: {...state[name], data, tableID}};
    }

    case ChannelActionType.SET_CHANNELS_DATA: {
      for (const [name, data] of action.payload) {
        state[name] = {...state[name], data}
      }
      return {...state};
    }

    case ChannelActionType.SET_SORT_ORDER: {
      const { name, order } = action.payload;
      const channel = state[name];
      return {...state, [name]: {...channel, query: {...channel.query, order}}};
    }

    case ChannelActionType.SET_MAX_ROW_COUNT: {
      const { name, count } = action.payload;
      const channel = state[name];
      const query: ChannelQuerySettings = {...channel.query, maxRowCount: count};
      return {...state, [name]: {...channel, query}}
    }

    case ChannelActionType.SET_ACTIVE_ROW: {
      const { name, row } = action.payload;
      const channelData = state[name]?.data;
      if (!channelData) return state;
      const channel = {...state[name], data: {...channelData, activeRow: row}};
      return {...state, [name]: channel};
    }

    default: return state;
  }
}
