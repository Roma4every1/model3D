import { WindowDataAction, WindowDataActions } from './window-data.reducer';


export const setWindowInfo = (text, stackTrace = null, header = null, fileToSaveName = null): WindowDataAction => {
  return {type: WindowDataActions.SET_INFO, header, text, stackTrace, fileToSaveName};
};

export const setWindowWarning = (text, stackTrace = null, header = null, fileToSaveName = null): WindowDataAction => {
  return {type: WindowDataActions.SET_WARNING, header, text, stackTrace, fileToSaveName};
};

export const setWindowError = (text, stackTrace = null, header = null, fileToSaveName = null): WindowDataAction => {
  return {type: WindowDataActions.SET_ERROR, header, text, stackTrace, fileToSaveName};
};

export const setOpenedWindow = (name: string, windowVisible: boolean, window, position = undefined): WindowDataAction => {
  return {type: WindowDataActions.SET_OPENED_WINDOW, windowName: name, windowVisible, window, position};
};

export const closeWindow = (): WindowDataAction => {
  return {type: WindowDataActions.CLOSE};
};

export const setWindowNotification = (text: any): WindowDataAction => {
  return {type: WindowDataActions.SET_NOTIFICATION, text};
};

export const closeWindowNotification = (): WindowDataAction => {
  return {type: WindowDataActions.CLOSE_NOTIFICATION};
};
