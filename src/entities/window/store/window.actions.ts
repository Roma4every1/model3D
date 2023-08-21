import { ReactNode } from 'react';
import { DialogProps, WindowProps } from '@progress/kendo-react-dialogs';
import { WindowAction, WindowActionType } from './window.reducer';


/** Показать информационное сообщение. */
export function showInfoMessage(text: string, title?: string): WindowAction {
  return {type: WindowActionType.SHOW_MESSAGE, payload: {type: 'info', title, text}};
}

/** Показать предупреждение. */
export function showWarningMessage(text: string, title?: string): WindowAction {
  return {type: WindowActionType.SHOW_MESSAGE, payload: {type: 'warning', title, text}};
}

/** Показать сообщение об ошибке. */
export function showErrorMessage(text: string, title?: string): WindowAction {
  return {type: WindowActionType.SHOW_MESSAGE, payload: {type: 'error', title, text}};
}

/** Показать диалог. */
export function showDialog(props: DialogProps, content: ReactNode): WindowAction {
  return {type: WindowActionType.SHOW_DIALOG, payload: {props, content}};
}

/** Показать окно. */
export function showWindow(id: WindowID, props: WindowProps, content: ReactNode): WindowAction {
  return {type: WindowActionType.SHOW_WINDOW, payload: {id, props, content}};
}

/** Закрыть указанное окно. */
export function closeWindow(id: WindowID): WindowAction {
  return {type: WindowActionType.CLOSE_WINDOW, payload: id};
}
