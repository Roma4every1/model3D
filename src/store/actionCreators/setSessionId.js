import SET from '../actions/sessionId/set';

function setSessionId(value) {
    return {
        type: SET,
        value: value
    };
}

export default setSessionId;