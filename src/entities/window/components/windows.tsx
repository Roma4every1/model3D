import { useWindowStore } from '../store/window.store';
import { closeWindow } from '../store/window.actions';

import './window.scss';
import { Window, Dialog } from '@progress/kendo-react-dialogs';
import { MessageDialog } from './message-dialog';


export const WindowHandler = () => {
  const states = useWindowStore();

  const toElement = (windowState: WindowState) => {
    const { id, props, content } = windowState;
    if (!props.onClose) {
      props.onClose = () => closeWindow(id);
    }
    if (id.startsWith('message')) {
      return <MessageDialog key={id} {...props}/>;
    }
    if (windowState.type === 'window') {
      const refCallback = props.onFocus ? (ref: {element: HTMLDivElement} | null) => {
        if (!ref || windowState.listenerAdded) return;
        ref.element.addEventListener('focusin', props.onFocus);
        windowState.listenerAdded = true;
      } : undefined;
      return <Window key={id} {...props} onFocus={undefined} children={content} ref={refCallback}/>;
    } else {
      return <Dialog key={id} {...props} children={content}/>;
    }
  };
  return <div>{Object.values(states).map(toElement)}</div>;
};
