export function windowsSelector(state: WState) {
  return state.windowData?.windows;
}

export function windowDataSelector(state: WState) {
  return state.windowData;
}
