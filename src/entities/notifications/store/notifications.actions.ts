import { NotificationAction, NotificationActionType } from './notifications.reducer';


/** Добавить уведомление. */
export function pushNotification(item: NotificationItem): NotificationAction {
  return {type: NotificationActionType.PUSH, payload: item};
}

/** Закрыть уведомление. */
export function closeNotification(id: NotificationID): NotificationAction {
  return {type: NotificationActionType.CLOSE, payload: id};
}
