import SETERROR from '../actions/windowData/setError';

function setWindowError(text, stackTrace = null, header = null, fileToSaveName = null) {
    return {
        type: SETERROR,
        header: header,
        text: text,
        stackTrace: stackTrace,
        fileToSaveName: fileToSaveName
    };
}

export default setWindowError;