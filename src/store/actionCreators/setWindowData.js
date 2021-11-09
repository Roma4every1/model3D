import SET from '../actions/windowData/set';

function setWindowData(header, text, windowType) {
    return {
        type: SET,
        header: header,
        text: text,
        windowType: windowType
    };
}

export default setWindowData;