/** Состояние таблицы. */
export function tableStateSelector(this: FormID, state: WState): TableState {
  return state.tables[this];
}

/** Параметров, необходимые для установки заголовков колонок. */
export function headerSetterParamsSelector(this: HeaderSetterRule[], state: WState): Parameter[] {
  if (!this.length) return;
  const globalParams = state.parameters[state.root.id];

  const values: Parameter[] = [];
  for (const rule of this) {
    let value = null;
    const paramID = rule.parameter;

    for (const param of globalParams) {
      if (param.id === paramID) value = param;
    }
    values.push(value);
  }
  return values;
}
