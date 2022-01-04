import SET from '../actions/channelsLoading/set';

function channelsLoading(state = [], action) {
    switch (action.type) {
        case SET:
            {
                return {
                    ...state,
                    [action.channelName]: {
                        loading: action.loading
                    }
                }
            }

        default: return state;
    }
}

export default channelsLoading;
