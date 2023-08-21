/** Состояния окон и диалогов приложения. */
export function windowStatesSelector(state: WState): WindowStates {
  return state.windows;
}

/** Состояние диалога или окна. */
export function windowStateSelector(this: WindowID, state: WState): WindowState {
  return state.windows[this];
}
