import { WindowDataAction, WindowDataActions } from './window-data.reducer';


export function setWindowWarning(text): WindowDataAction {
  return {type: WindowDataActions.SET_WARNING, text};
}

export function setOpenedWindow(name: string, windowVisible: boolean, window, position = undefined): WindowDataAction {
  return {type: WindowDataActions.SET_OPENED_WINDOW, windowName: name, windowVisible, window, position};
}

export function closeMessageWindow(): WindowDataAction {
  return {type: WindowDataActions.CLOSE};
}
