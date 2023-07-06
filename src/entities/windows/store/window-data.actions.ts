import { WindowDataAction, WindowDataActions } from './window-data.reducer';


export function setWindowInfo(text, stackTrace = null, header = null, fileToSaveName = null): WindowDataAction {
  return {type: WindowDataActions.SET_INFO, header, text, stackTrace, fileToSaveName};
}

export function setWindowWarning(text, stackTrace = null, header = null, fileToSaveName = null): WindowDataAction {
  return {type: WindowDataActions.SET_WARNING, header, text, stackTrace, fileToSaveName};
}

export function setOpenedWindow(name: string, windowVisible: boolean, window, position = undefined): WindowDataAction {
  return {type: WindowDataActions.SET_OPENED_WINDOW, windowName: name, windowVisible, window, position};
}

export function closeWindow(): WindowDataAction {
  return {type: WindowDataActions.CLOSE};
}

export function setWindowNotification(text: any): WindowDataAction {
  return {type: WindowDataActions.SET_NOTIFICATION, text};
}

export function closeWindowNotification(): WindowDataAction {
  return {type: WindowDataActions.CLOSE_NOTIFICATION};
}
