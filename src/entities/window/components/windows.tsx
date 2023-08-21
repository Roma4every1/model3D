import { useDispatch, useSelector } from 'react-redux';
import { windowStatesSelector } from '../store/window.selectors';
import { closeWindow } from '../store/window.actions';

import './window.scss';
import { Window, Dialog } from '@progress/kendo-react-dialogs';
import { MessageDialog } from './message-dialog';


export const WindowHandler = () => {
  const dispatch = useDispatch();
  const states = useSelector(windowStatesSelector);

  const stateToElement = ({id, type, props, content}: WindowState, i: number) => {
    if (!props.onClose) {
      props.onClose = () => dispatch(closeWindow(id));
    }
    if (id.startsWith('message')) {
      return <MessageDialog key={i} {...props}/>;
    }
    if (type === 'window') {
      return <Window key={i} {...props} children={content}/>;
    } else {
      return <Dialog key={i} {...props} children={content}/>;
    }
  };
  return <div>{Object.values(states).map(stateToElement)}</div>;
};
