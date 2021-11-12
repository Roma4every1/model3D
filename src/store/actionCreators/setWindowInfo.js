import SETINFO from '../actions/windowData/setInfo';

function setWindowInfo(text, stackTrace = null, header = null) {
    return {
        type: SETINFO,
        header: header,
        text: text,
        stackTrace: stackTrace
    };
}

export default setWindowInfo;