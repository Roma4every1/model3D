/** Группа уведомлений. */
type Notifications = NotificationItem[];

/** ### Уведомление.
 * + `id`: {@link NotificationID}
 * + `type`: {@link NotificationType}
 * + `content`: {@link NotificationContent}
 * + `icon: boolean`
 * */
interface NotificationItem {
  /** Идентификатор уведомления (autoincrement). */
  id: NotificationID,
  /** Тип уведомления. */
  type: NotificationType,
  /** Текст уведомления. */
  content: NotificationContent,
  /** Нужно ли показывать иконку. */
  icon: boolean,
}

/** Прототип уведомления. */
interface NotificationProto {
  /** Тип уведомления. */
  type?: NotificationType,
  /** Текст уведомления. */
  content: NotificationContent,
  /** Нужно ли показывать иконку. */
  icon?: boolean,
}

/** Идентификатор уведомления. */
type NotificationID = number;
/** Тип уведомления. */
type NotificationType = 'info' | 'success' | 'warning' | 'error';
/** Текст уведомления. */
type NotificationContent = string;
