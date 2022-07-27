/* --- actions types --- */

export enum ChannelsLoadingActions {
  SET = 'channelsLoading/set',
}

/* --- actions interfaces --- */

export interface ActionSet {
  type: ChannelsLoadingActions.SET,
  channelName: ChannelName,
  loading: IsChannelLoading,
}

export type ChannelsLoadingAction = ActionSet;

/* --- reducer --- */

const initChannelsLoading: ChannelsLoading = {};

export const channelsLoadingReducer = (state: ChannelsLoading = initChannelsLoading, action: ChannelsLoadingAction): ChannelsLoading => {
  switch (action.type) {

    case ChannelsLoadingActions.SET: {
      return {...state, [action.channelName]: {loading: action.loading}};
    }

    default: return state;
  }
}
