/** Состояние формы графика. */
export function chartStateSelector(this: FormID, state: WState): ChartState {
  return state.charts[this];
}
