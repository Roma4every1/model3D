export function formRefValueSelector(this: FormID, state: WState) {
  return state.dataSets[this]?.current;
}
