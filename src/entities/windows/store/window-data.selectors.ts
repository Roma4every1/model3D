export function windowsSelector(state: WState) {
  return state.windowData?.windows;
}

export function messageWindowSelector(state: WState) {
  return state.windowData?.messageWindow;
}
