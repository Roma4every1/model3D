import SETOPENEDWINDOW from '../actions/windowData/setOpenedWindow';

function setOpenedWindow(windowName, windowVisible, window) {
    return {
        type: SETOPENEDWINDOW,
        windowName: windowName,
        windowVisible: windowVisible,
        window: window
    };
}

export default setOpenedWindow;