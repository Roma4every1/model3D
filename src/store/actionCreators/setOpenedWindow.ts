import {WindowDataActions, ActionSetOpenedWindow} from "../reducers/windowData";


const setOpenedWindow = (windowName: string, windowVisible: boolean, window, position = undefined): ActionSetOpenedWindow => {
  return {type: WindowDataActions.SET_OPENED_WINDOW, windowName, windowVisible, window, position};
}

export default setOpenedWindow;
