export function windowsSelector(state: WState) {
  return state.windowData?.windows;
}

export function notificationSelector(state: WState) {
  return state.windowData?.Notification;
}

export function messageWindowSelector(state: WState) {
  return state.windowData?.messageWindow;
}
