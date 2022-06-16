/* --- actions types --- */

export enum ChannelsDataActions {
  SET = 'channelsData/set',
}

/* --- actions interfaces --- */

export interface ActionSet {
  type: ChannelsDataActions.SET,
  channelName: ChannelName,
  channelData: any,
}

export type ChannelsDataAction = ActionSet;

/* --- reducer --- */

const initChannelsData: ChannelsData = {};

export const channelsData = (state: ChannelsData = initChannelsData, action: ChannelsDataAction): ChannelsData => {
  switch (action.type) {

    case ChannelsDataActions.SET: {
      return {...state, [action.channelName]: action.channelData};
    }

    default: return state;
  }
}
