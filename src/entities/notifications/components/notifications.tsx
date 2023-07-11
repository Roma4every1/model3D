import { useSelector } from 'react-redux';
import { notificationsSelector } from '../store/notifications.selectors';
import { Notification } from '@progress/kendo-react-notification';
import './notifications.scss';


/** Группа уведомлений. */
export const Notifications = () => {
  const notifications = useSelector(notificationsSelector);

  const itemToElement = (item: NotificationItem, i: number) => {
    return (
      <Notification key={i} type={{style: item.type, icon: item.icon}}>
        {item.content}
      </Notification>
    );
  };

  return (
    <div className={'k-notification-group notifications'}>
      {notifications.map(itemToElement)}
    </div>
  );
};
