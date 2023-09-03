import { Thunk, AppDispatch } from 'shared/lib';
import { pushNotification, closeNotification } from './notifications.actions';


let counter = 0;

/** Вывести уведомление.
 * @param proto прототип или текст уведомления
 * @param duration длительность показа уведомления в секундах
 * */
export function showNotification(proto: NotificationProto | NotificationContent, duration = 4): Thunk {
  return async (dispatch: AppDispatch) => {
    if (typeof proto === 'string') proto = {content: proto};
    const id = ++counter;

    const notification: NotificationItem = {
      id: id,
      type: proto.type ?? 'info',
      icon: proto.icon ?? true,
      content: proto.content,
    };
    dispatch(pushNotification(notification));
    setTimeout(() => { dispatch(closeNotification(id)); }, duration * 1000);
  };
}
