import SETWARNING from '../actions/windowData/setWarning';

function setWindowWarning(text, stackTrace = null, header = null) {
    return {
        type: SETWARNING,
        header: header,
        text: text,
        stackTrace: stackTrace
    };
}

export default setWindowWarning;