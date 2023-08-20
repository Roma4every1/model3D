import { t } from 'shared/locales';

/* --- Action Types --- */

export enum WindowDataActions {
  SET_WARNING = 'windowData/setWarning',
  SET_OPENED_WINDOW = 'windowData/setOpenedWindow',
  CLOSE = 'windowData/close'
}

/* --- Action Interfaces --- */

interface ActionSetWarning {
  type: WindowDataActions.SET_WARNING,
  text: any,
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

export type WindowDataAction = ActionSetWarning | ActionSetOpenedWindow | ActionClose;

/* --- Init State & Reducer --- */

const init: any = {
  windows: null,
  messageWindow: null,
};

export function windowDataReducer(state = init, action: WindowDataAction) {
  let newState = {...state};
  switch (action.type) {

    case WindowDataActions.SET_WARNING: {
      newState.messageWindow = {
        opened: true,
        header: t('base.warning'),
        text: action.text,
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

    default: return state;
  }
}
