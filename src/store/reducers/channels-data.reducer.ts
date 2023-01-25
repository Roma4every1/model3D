/* --- Action Types --- */

export enum ChannelsDataActions {
  SET = 'channelsData/set',
}

/* --- Action Interfaces --- */

interface ActionSet {
  type: ChannelsDataActions.SET,
  channelName: ChannelName,
  channelData: Channel,
}

export type ChannelsDataAction = ActionSet;

/* --- Init State & Reducer --- */

const init: ChannelsData = {};

export const channelsDataReducer = (state: ChannelsData = init, action: ChannelsDataAction): ChannelsData => {
  switch (action.type) {

    case ChannelsDataActions.SET: {
      return {...state, [action.channelName]: action.channelData};
    }

    default: return state;
  }
};
