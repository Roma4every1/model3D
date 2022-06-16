import i18n from '../../i18n';

/* --- actions types --- */

export enum WindowDataActions {
  SET_INFO = 'windowData/setInfo',
  SET_WARNING = 'windowData/setWarning',
  SET_ERROR = 'windowData/setError',
  SET_OPENED_WINDOW = 'windowData/setOpenedWindow',
  CLOSE = 'windowData/close',
  SET_NOTIFICATION = 'windowData/setNotification',
  CLOSE_NOTIFICATION = 'windowData/closeNotification',
}

/* --- actions interfaces --- */

export interface ActionSetInfo {
  type: WindowDataActions.SET_INFO,
  header: any,
  text: any,
  stackTrace: any,
  fileToSaveName: any,
}
export interface ActionSetWarning {
  type: WindowDataActions.SET_WARNING,
  header: any,
  text: any,
  stackTrace: any,
  fileToSaveName: any,
}
export interface ActionSetError {
  type: WindowDataActions.SET_ERROR,
  header: any,
  text: any,
  stackTrace: any,
  fileToSaveName: any,
}
export interface ActionSetOpenedWindow {
  type: WindowDataActions.SET_OPENED_WINDOW,
  windowName: any,
  windowVisible: any,
  window: any,
  position: any,
}
export interface ActionClose {
  type: WindowDataActions.CLOSE,
}
export interface ActionSetNotification {
  type: WindowDataActions.SET_NOTIFICATION,
  text: any,
}
export interface ActionCloseNotification {
  type: WindowDataActions.CLOSE_NOTIFICATION,
}

export type WindowDataAction = ActionSetInfo | ActionSetWarning | ActionSetError |
  ActionSetOpenedWindow | ActionClose | ActionSetNotification | ActionCloseNotification;

/* --- reducer --- */

const initWindowData = null;

export const windowData = (state = initWindowData, action: WindowDataAction) => {
  let newState = {...state };
  switch (action.type) {

    case WindowDataActions.SET_INFO: {
      newState.messageWindow = {
        opened: true,
        header: action.header ?? i18n.t('base.info'),
        text: action.text,
        stackTrace: action.stackTrace,
        fileToSaveName: action.fileToSaveName,
        type: "info"
      }
      return newState;
    }

    case WindowDataActions.SET_WARNING: {
      newState.messageWindow = {
        opened: true,
        header: action.header ?? i18n.t('base.warning'),
        text: action.text,
        stackTrace: action.stackTrace,
        fileToSaveName: action.fileToSaveName,
        type: "warning"
      }
      return newState;
    }

    case WindowDataActions.SET_ERROR: {
      newState.messageWindow = {
        opened: true,
        header: action.header ?? i18n.t('base.error'),
        text: action.text,
        stackTrace: action.stackTrace,
        fileToSaveName: action.fileToSaveName,
        type: "error"
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
