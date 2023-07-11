import { Dispatch } from 'redux';
import { Thunk } from 'shared/lib';
import { pushNotification, closeNotification } from './notifications.actions';


let counter = 0;
const defaultErrorNotice = 'Ошибка при выполнении запроса';

/** Вывести уведомление.
 * @param proto прототип или текст уведомления
 * @param duration длительность показа уведомления в секундах
 * */
export function showNotification(proto: NotificationProto | NotificationContent, duration = 3): Thunk {
  return async (dispatch: Dispatch) => {
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

/** Принимает {@link Promise}, при его завершении выведется уведомление.
 * @param promise промис
 * @param dispatch функция из `useDispatch`
 * @param successText текст уведомления
 * @param errorText текст уведомления в случае ошибки
 * @param duration сколько секунд будет показываться уведомление
 * */
export function callbackWithNotices(
  promise: Promise<any>, dispatch: Dispatch,
  successText: string, errorText = defaultErrorNotice, duration = 3,
) {
  promise.then(() => {
    const id = ++counter;
    dispatch(pushNotification({id: id, type: 'info', icon: true, content: successText}));
    setTimeout(() => { dispatch(closeNotification(id)); }, duration * 1000);
  }).catch(() => {
    const id = ++counter;
    dispatch(pushNotification({id: id, type: 'info', icon: true, content: errorText}));
    setTimeout(() => { dispatch(closeNotification(id)); }, duration * 1000);
  });
}
