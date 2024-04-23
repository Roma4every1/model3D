import { useNotificationStore } from './notification.store';


/** Добавить уведомление. */
export function pushNotification(item: NotificationItem): void {
  const current = useNotificationStore.getState().notifications;
  useNotificationStore.setState({notifications: [...current, item]});
}

/** Закрыть уведомление. */
export function closeNotification(id: NotificationID): void {
  const current = useNotificationStore.getState().notifications;
  const index = current.findIndex(item => item.id === id);
  if (index === -1) return;

  current.splice(index, 1);
  useNotificationStore.setState({notifications: [...current]});
}

let counter = 0;

/** Вывести уведомление.
 * @param proto прототип или текст уведомления
 * @param duration длительность показа уведомления в секундах
 * */
export function showNotification(proto: NotificationProto | NotificationContent, duration = 4): void {
  if (typeof proto === 'string') proto = {content: proto};
  const id = ++counter;

  const notification: NotificationItem = {
    id: id, type: proto.type ?? 'info',
    icon: proto.icon ?? true, content: proto.content,
  };

  pushNotification(notification);
  setTimeout(() => { closeNotification(id); }, duration * 1000);
}
