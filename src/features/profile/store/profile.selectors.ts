export function profileStateSelector(this: FormID, state: WState): ProfileState {
  return state.profiles[this];
}
