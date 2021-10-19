import SET from '../actions/channelsData/set';

function channelsData(state = [], action) {
    switch (action.type) {
        case SET:
            {
                return {
                    ...state,
                    [action.channelName]: action.channelData
                }
            }

        default: return state;
    }
}

export default channelsData;
