import SET from '../actions/sessionId/set';

function sessionId(state = '', action) {
    switch (action.type) {
        case SET: return action.value;

        default: return state;
    }
}

export default sessionId;