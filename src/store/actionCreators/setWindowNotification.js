import SETNOTIFICATION from '../actions/windowData/setNotification';

function setWindowNotification(text) {
    return {
        type: SETNOTIFICATION,
        text: text,
    };
}

export default setWindowNotification;