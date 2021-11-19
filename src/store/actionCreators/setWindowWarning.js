import SETWARNING from '../actions/windowData/setWarning';

function setWindowWarning(text, stackTrace = null, header = null, fileToSaveName = null) {
    return {
        type: SETWARNING,
        header: header,
        text: text,
        stackTrace: stackTrace,
        fileToSaveName: fileToSaveName
    };
}

export default setWindowWarning;