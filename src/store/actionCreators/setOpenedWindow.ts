import {WindowDataActions, ActionSetOpenedWindow} from "../reducers/windowData";


const setOpenedWindow = (windowName, windowVisible, window, position): ActionSetOpenedWindow => {
  return {type: WindowDataActions.SET_OPENED_WINDOW, windowName, windowVisible, window, position};
}

export default setOpenedWindow;
