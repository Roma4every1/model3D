import SET from '../actions/windowData/set';

function setWindowData(text, windowType) {
    return {
        type: SET,
        text: text,
        windowType: windowType
    };
}

export default setWindowData;