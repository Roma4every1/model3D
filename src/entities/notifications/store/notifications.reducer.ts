/* --- Action Types --- */

export enum NotificationActionType {
  PUSH = 'notifications/push',
  CLOSE = 'notifications/close',
}

/* --- Action Interfaces --- */

interface ActionAdd {
  type: NotificationActionType.PUSH,
  payload: NotificationItem,
}
interface ActionClose {
  type: NotificationActionType.CLOSE,
  payload: NotificationID,
}

export type NotificationAction = ActionAdd | ActionClose;

/* --- Init State & Reducer --- */

const init: Notifications = [];

export function notificationsReducer(state: Notifications = init, action: NotificationAction): Notifications {
  switch (action.type) {

    case NotificationActionType.PUSH: {
      return [...state, action.payload];
    }

    case NotificationActionType.CLOSE: {
      const index = state.findIndex(item => item.id === action.payload);
      if (index === -1) return state;
      state.splice(index, 1);
      return [...state];
    }

    default: return state;
  }
}
