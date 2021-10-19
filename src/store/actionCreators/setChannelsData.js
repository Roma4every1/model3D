import SET from '../actions/channelsData/set';

function setChannelsData(channelName, channelData) {
    return {
        type: SET,
        channelName: channelName,
        channelData: channelData
    };
}

export default setChannelsData;