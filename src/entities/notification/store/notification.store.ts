import { create } from 'zustand';


export interface NotificationStore {
  notifications: Notifications;
}

export const useNotificationStore = create<NotificationStore>(() => ({
  notifications: [],
}));

export const useNotifications = () => useNotificationStore(state => state.notifications);
