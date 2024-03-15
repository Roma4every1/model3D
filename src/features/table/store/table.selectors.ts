/** Состояние таблицы. */
export function tableStateSelector(this: FormID, state: WState): TableState {
  return state.tables[this];
}

/** Возвращает селектор параметров, необходимых для установки заголовков таблицы.
 * @param parentID идентификатор презентации, в которой находится таблица
 * @param rules правила подстановки
 * */
export function getHeaderSetterParamSelector(parentID: ClientID, rules: HeaderSetterRule[]) {
  return (state: WState): Parameter[] => {
    if (!rules.length) return [];
    const globalParams = state.parameters[state.root.id];
    const localParams = state.parameters[parentID];

    return rules.map(({parameter: parameterID}) => {
      const findFn = (p: Parameter): boolean => p.id === parameterID;
      return globalParams.find(findFn) ?? localParams?.find(findFn) ?? null;
    });
  };
}
