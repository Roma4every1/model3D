import { ReactNode, CSSProperties } from 'react';
import { DialogProps, WindowProps } from '@progress/kendo-react-dialogs';

/* --- Action Types --- */

export enum WindowActionType {
  SHOW_MESSAGE = 'window/message',
  SHOW_DIALOG = 'window/dialog',
  SHOW_WINDOW = 'window/window',
  CLOSE_WINDOW = 'window/close',
  UPDATE_WINDOW = 'window/update',
}

/* --- Action Interfaces --- */

interface ActionShowMessage {
  type: WindowActionType.SHOW_MESSAGE;
  payload: {type: MessageDialogType, title?: string, style?: CSSProperties, text: string};
}
interface ActionShowDialog {
  type: WindowActionType.SHOW_DIALOG;
  payload: {id: WindowID, props: DialogProps, content: ReactNode};
}
interface ActionShowWindow {
  type: WindowActionType.SHOW_WINDOW;
  payload: {id: WindowID, props: WindowProps, content: ReactNode};
}
interface ActionCloseWindow {
  type: WindowActionType.CLOSE_WINDOW;
  payload: WindowID;
}
interface ActionUpdateWindow {
  type: WindowActionType.UPDATE_WINDOW;
  payload: {id: WindowID, props: WindowProps | DialogProps};
}

export type WindowAction = ActionShowMessage | ActionShowDialog |
  ActionShowWindow | ActionCloseWindow | ActionUpdateWindow;

/* --- Init State & Reducer --- */

let counter = 0;
const init: WindowStates = {};

export function windowReducer(state: WindowStates = init, action: WindowAction): WindowStates {
  switch (action.type) {

    case WindowActionType.SHOW_MESSAGE: {
      const { type, title, style, text } = action.payload;
      const id = `message-${++counter}`;
      const props: MessageDialogProps = {type, title, style, content: text};
      return {...state, [id]: {id, type: 'dialog', props, content: text}};
    }

    case WindowActionType.SHOW_DIALOG: {
      const { id, props, content } = action.payload;
      return {...state, [id]: {id, type: 'dialog', props, content}};
    }

    case WindowActionType.SHOW_WINDOW: {
      const { id, props, content } = action.payload;
      return {...state, [id]: {id, type: 'window', props, content}};
    }

    case WindowActionType.CLOSE_WINDOW: {
      delete state[action.payload];
      return {...state};
    }

    case WindowActionType.UPDATE_WINDOW: {
      const { id, props } = action.payload;
      const windowState = state[id];
      if (!windowState) return state;
      return {...state, [id]: {...windowState, props: {...windowState.props, ...props}}};
    }

    default: return state;
  }
}
