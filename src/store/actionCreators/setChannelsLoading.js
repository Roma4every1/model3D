import SET from '../actions/channelsLoading/set';

function setChannelsLoading(channelName, loading) {
    return {
        type: SET,
        channelName: channelName,
        loading: loading
    };
}

export default setChannelsLoading;