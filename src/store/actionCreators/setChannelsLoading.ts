import {ChannelsLoadingActions, ActionSet} from "../reducers/channelsLoading";


const setChannelsLoading = (channelName: ChannelName, loading: IsChannelLoading): ActionSet => {
    return {type: ChannelsLoadingActions.SET, channelName, loading};
}

export default setChannelsLoading;
