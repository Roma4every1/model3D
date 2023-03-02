/* --- Action Types --- */

export enum ChannelsActions {
  SET_CHANNEL = 'channels/set',
  SET_CHANNELS = 'channels/sets',
  SET_CHANNEL_DATA = 'channels/datum',
  SET_CHANNELS_DATA = 'channels/data',
  SET_MAX_ROW_COUNT = 'channels/count',
  CLEAR = 'channels/clear',
}

/* --- Action Interfaces --- */

interface ActionSetChannel {
  type: ChannelsActions.SET_CHANNEL,
  payload: {name: ChannelName, channel: Channel};
}
interface ActionSetChannels {
  type: ChannelsActions.SET_CHANNELS,
  payload: ChannelDict,
}
interface ActionSetChannelData {
  type: ChannelsActions.SET_CHANNEL_DATA,
  payload: {name: ChannelName, data: ChannelData, tableID: TableID},
}
interface ActionSetChannelsData {
  type: ChannelsActions.SET_CHANNELS_DATA,
  payload: ChannelDataEntries,
}
interface ActionSetMaxRowCount {
  type: ChannelsActions.SET_MAX_ROW_COUNT,
  payload: {name: ChannelName, count: number | null}
}
interface ActionClear {
  type: ChannelsActions.CLEAR,
}

export type ChannelsAction = ActionSetChannel | ActionSetChannels |
  ActionSetChannelData | ActionSetChannelsData | ActionSetMaxRowCount | ActionClear;

/* --- Init State & Reducer --- */

const init: ChannelDict = {};

export const channelsReducer = (state: ChannelDict = init, action: ChannelsAction): ChannelDict => {
  switch (action.type) {

    case ChannelsActions.SET_CHANNEL: {
      const { name, channel } = action.payload;
      return {...state, [name]: channel};
    }

    case ChannelsActions.SET_CHANNELS: {
      return {...state, ...action.payload};
    }

    case ChannelsActions.SET_CHANNEL_DATA: {
      const { name, data, tableID } = action.payload;
      return {...state, [name]: {...state[name], data, tableID}};
    }

    case ChannelsActions.SET_CHANNELS_DATA: {
      for (const [name, data] of action.payload) {
        state[name] = {...state[name], data}
      }
      return {...state};
    }

    case ChannelsActions.SET_MAX_ROW_COUNT: {
      const { name, count } = action.payload;
      const channel = state[name];
      const query: ChannelQuerySettings = {...channel.query, maxRowCount: count};
      return {...state, [name]: {...channel, query}}
    }

    case ChannelsActions.CLEAR: {
      return {};
    }

    default: return state;
  }
};
