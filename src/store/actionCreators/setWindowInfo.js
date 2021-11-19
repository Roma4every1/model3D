import SETINFO from '../actions/windowData/setInfo';

function setWindowInfo(text, stackTrace = null, header = null, fileToSaveName = null) {
    return {
        type: SETINFO,
        header: header,
        text: text,
        stackTrace: stackTrace,
        fileToSaveName: fileToSaveName
    };
}

export default setWindowInfo;