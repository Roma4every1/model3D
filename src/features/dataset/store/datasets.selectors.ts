export function formRefSelector(this: FormID, state: WState) {
  return state.dataSets[this];
}

export function formRefValueSelector(this: FormID, state: WState) {
  return state.dataSets[this]?.current;
}
