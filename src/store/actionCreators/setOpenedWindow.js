import SETOPENEDWINDOW from '../actions/windowData/setOpenedWindow';

function setOpenedWindow(windowName, windowVisible, window, position) {
    return {
        type: SETOPENEDWINDOW,
        windowName: windowName,
        windowVisible: windowVisible,
        window: window,
        position: position
    };
}

export default setOpenedWindow;