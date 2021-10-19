import SET from '../actions/sessionManager/set';

function setSessionManager(value) {
    return {
        type: SET,
        value: value
    };
}

export default setSessionManager;