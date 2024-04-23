import { Notification } from '@progress/kendo-react-notification';
import { useNotifications } from '../store/notification.store';
import './notifications.scss';


/** Группа уведомлений. */
export const Notifications = () => {
  const notifications = useNotifications();

  const toElement = (item: NotificationItem, i: number) => {
    return (
      <Notification key={i} type={{style: item.type, icon: item.icon}}>
        {item.content}
      </Notification>
    );
  };

  return (
    <div className={'k-notification-group notifications'}>
      {notifications.map(toElement)}
    </div>
  );
};
