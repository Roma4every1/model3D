import {WindowDataActions, ActionCloseNotification} from "../reducers/windowData";


function closeWindowNotification(): ActionCloseNotification {
    return {type: WindowDataActions.CLOSE_NOTIFICATION};
}

export default closeWindowNotification;
