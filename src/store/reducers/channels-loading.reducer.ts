/* --- Action Types --- */

export enum ChannelsLoadingActions {
  SET = 'channelsLoading/set',
}

/* --- Action Interfaces --- */

interface ActionSet {
  type: ChannelsLoadingActions.SET,
  channelName: ChannelName,
  loading: IsChannelLoading,
}

export type ChannelsLoadingAction = ActionSet;

/* --- Init State & Reducer --- */

const init: ChannelsLoading = {};

export const channelsLoadingReducer = (state: ChannelsLoading = init, action: ChannelsLoadingAction): ChannelsLoading => {
  switch (action.type) {

    case ChannelsLoadingActions.SET: {
      return {...state, [action.channelName]: {loading: action.loading}};
    }

    default: return state;
  }
};
