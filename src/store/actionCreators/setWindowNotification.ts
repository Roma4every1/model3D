import {ActionSetNotification, WindowDataActions} from "../reducers/windowData";


function setWindowNotification(text: any): ActionSetNotification  {
    return {type: WindowDataActions.SET_NOTIFICATION, text};
}

export default setWindowNotification;
