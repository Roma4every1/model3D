/** Состояние таблицы. */
export function tableStateSelector(this: FormID, state: WState): TableState {
  return state.tables[this];
}
