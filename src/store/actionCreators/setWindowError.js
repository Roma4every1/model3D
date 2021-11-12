import SETERROR from '../actions/windowData/setError';

function setWindowError(text, stackTrace = null, header = null) {
    return {
        type: SETERROR,
        header: header,
        text: text,
        stackTrace: stackTrace
    };
}

export default setWindowError;