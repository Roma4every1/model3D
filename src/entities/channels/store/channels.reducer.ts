/* --- Action Types --- */

export enum ChannelsActions {
  SET_CHANNEL = 'channels/set',
  SET_CHANNELS = 'channels/sets',
  SET_CHANNEL_DATA = 'channels/datum',
  SET_CHANNELS_DATA = 'channels/data',
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
interface ActionClear {
  type: ChannelsActions.CLEAR,
}

export type ChannelsAction = ActionSetChannel | ActionSetChannels |
  ActionSetChannelData | ActionSetChannelsData | ActionClear;

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

    case ChannelsActions.CLEAR: {
      return {};
    }

    default: return state;
  }
};
