import { ReactNode } from 'react';
import { DialogProps, WindowProps } from '@progress/kendo-react-dialogs';

/* --- Action Types --- */

export enum WindowActionType {
  SHOW_MESSAGE = 'window/message',
  SHOW_DIALOG = 'window/dialog',
  SHOW_WINDOW = 'window/window',
  CLOSE_WINDOW = 'window/close',
}

/* --- Action Interfaces --- */

interface ActionShowMessage {
  type: WindowActionType.SHOW_MESSAGE;
  payload: {type: MessageDialogType, title?: string, text: string};
}
interface ActionShowDialog {
  type: WindowActionType.SHOW_DIALOG;
  payload: {props: DialogProps, content: ReactNode};
}
interface ActionShowWindow {
  type: WindowActionType.SHOW_WINDOW;
  payload: {id: WindowID, props: WindowProps, content: ReactNode};
}
interface ActionCloseWindow {
  type: WindowActionType.CLOSE_WINDOW;
  payload: WindowID;
}

export type WindowAction = ActionShowMessage | ActionShowDialog |
  ActionShowWindow | ActionCloseWindow;

/* --- Init State & Reducer --- */

let counter = 0;
const init: WindowStates = {};

export function windowReducer(state: WindowStates = init, action: WindowAction): WindowStates {
  switch (action.type) {

    case WindowActionType.SHOW_MESSAGE: {
      const { type, title, text } = action.payload;
      const id = `message-${++counter}`;
      const props = {type, title, content: text};
      return {...state, [id]: {id, type: 'dialog', props, content: text}};
    }

    case WindowActionType.SHOW_DIALOG: {
      const { props, content } = action.payload;
      return {...state, [++counter]: {type: 'dialog', props, content}};
    }

    case WindowActionType.SHOW_WINDOW: {
      const { props, content } = action.payload;
      for (const id in state) state[id].active = false;
      return {...state, [++counter]: {type: 'window', props, content, active: true}};
    }

    case WindowActionType.CLOSE_WINDOW: {
      delete state[action.payload];
      return {...state};
    }

    default: return state;
  }
}
