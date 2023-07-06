import { t } from 'shared/locales';

/* --- Action Types --- */

export enum WindowDataActions {
  SET_INFO = 'windowData/setInfo',
  SET_WARNING = 'windowData/setWarning',
  SET_OPENED_WINDOW = 'windowData/setOpenedWindow',
  CLOSE = 'windowData/close',
  SET_NOTIFICATION = 'windowData/setNotification',
  CLOSE_NOTIFICATION = 'windowData/closeNotification',
}

/* --- Action Interfaces --- */

interface ActionSetInfo {
  type: WindowDataActions.SET_INFO,
  header: any,
  text: any,
  stackTrace: any,
  fileToSaveName: any,
}
interface ActionSetWarning {
  type: WindowDataActions.SET_WARNING,
  header: any,
  text: any,
  stackTrace: any,
  fileToSaveName: any,
}
interface ActionSetOpenedWindow {
  type: WindowDataActions.SET_OPENED_WINDOW,
  windowName: any,
  windowVisible: any,
  window: any,
  position: any,
}
interface ActionClose {
  type: WindowDataActions.CLOSE,
}
interface ActionSetNotification {
  type: WindowDataActions.SET_NOTIFICATION,
  text: any,
}
interface ActionCloseNotification {
  type: WindowDataActions.CLOSE_NOTIFICATION,
}

export type WindowDataAction = ActionSetInfo | ActionSetWarning | ActionSetOpenedWindow |
  ActionClose | ActionSetNotification | ActionCloseNotification;

/* --- Init State & Reducer --- */

const init = null;

export function windowDataReducer(state = init, action: WindowDataAction) {
  let newState = {...state};
  switch (action.type) {

    case WindowDataActions.SET_INFO: {
      newState.messageWindow = {
        opened: true,
        header: action.header || t('base.info'),
        text: action.text,
        stackTrace: action.stackTrace,
        fileToSaveName: action.fileToSaveName,
        type: 'info'
      }
      return newState;
    }

    case WindowDataActions.SET_WARNING: {
      newState.messageWindow = {
        opened: true,
        header: action.header || t('base.warning'),
        text: action.text,
        stackTrace: action.stackTrace,
        fileToSaveName: action.fileToSaveName,
        type: 'warning'
      }
      return newState;
    }

    case WindowDataActions.SET_OPENED_WINDOW: {
      newState.windows = { ...newState.windows };
      newState.windows[action.windowName] = {
        visible: action.windowVisible,
        window: action.window,
        position: action.position ?? newState.windows[action.windowName]?.position
      };
      return newState;
    }

    case WindowDataActions.CLOSE: {
      newState.messageWindow = {opened: false};
      return newState;
    }

    case WindowDataActions.SET_NOTIFICATION: {
      newState.Notification = {opened: true, text: action.text};
      return newState;
    }

    case WindowDataActions.CLOSE_NOTIFICATION: {
      newState.Notification = {opened: false};
      return newState;
    }

    default: return state;
  }
}
