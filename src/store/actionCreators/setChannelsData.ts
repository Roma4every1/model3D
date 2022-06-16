import {ActionSet, ChannelsDataActions} from "../reducers/channelsData";


const setChannelsData = (channelName: ChannelName, channelData): ActionSet => {
  return {type: ChannelsDataActions.SET, channelName, channelData};
}

export default setChannelsData;
