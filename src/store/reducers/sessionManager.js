import SET from '../actions/sessionManager/set';

function sessionManager(state = null, action) {
    switch (action.type) {
        case SET: return action.value;

        default: return state;
    }
}

export default sessionManager;