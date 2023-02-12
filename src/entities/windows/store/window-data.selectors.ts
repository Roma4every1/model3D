export const windowsSelector = (state: WState) => {
  return state.windowData?.windows;
};

export const notificationSelector = (state: WState) => {
  return state.windowData?.Notification;
};

export const messageWindowSelector = (state: WState) => {
  return state.windowData?.messageWindow;
};
