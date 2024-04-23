import { ReactNode, CSSProperties } from 'react';
import { DialogProps, WindowProps } from '@progress/kendo-react-dialogs';
import { useWindowStore } from './window.store';


let counter = 0;

/** Показать информационное сообщение. */
export function showInfoMessage(text: string, title?: string, style?: CSSProperties): void {
  const id = `message-${++counter}`;
  const props: MessageDialogProps = {type: 'info', title, style, content: text};
  useWindowStore.setState({[id]: {id, type: 'dialog', props, content: text}});
}

/** Показать предупреждение. */
export function showWarningMessage(text: string, title?: string, style?: CSSProperties): void {
  const id = `message-${++counter}`;
  const props: MessageDialogProps = {type: 'warning', title, style, content: text};
  useWindowStore.setState({[id]: {id, type: 'dialog', props, content: text}});
}

/** Показать диалог. */
export function showDialog(id: WindowID, props: DialogProps, content: ReactNode): void {
  useWindowStore.setState({[id]: {id, type: 'dialog', props, content}});
}

/** Показать окно. */
export function showWindow(id: WindowID, props: WindowProps, content: ReactNode): void {
  useWindowStore.setState({[id]: {id, type: 'window', props, content}});
}

/** Закрыть указанное окно. */
export function closeWindow(id: WindowID): void {
  const state = useWindowStore.getState();
  delete state[id];
  useWindowStore.setState({...state});
}

/** Обновить свойства окна или диалога. */
export function updateWindow(id: WindowID, props: WindowProps | DialogProps): void {
  const windowState = useWindowStore.getState()[id];
  if (!windowState) return;
  useWindowStore.setState({[id]: {...windowState, props: {...windowState.props, ...props}}});
}
