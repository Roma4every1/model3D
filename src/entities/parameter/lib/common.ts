/** Находит в хранилище параметров нужные элементы и наполняет массив. */
export function findParameters(ids: Iterable<ParameterID>, storage: ParameterMap): Parameter[] {
  const result: Parameter[] = [];
  for (const id of ids) {
    const parameter = storage.get(id);
    if (parameter) result.push(parameter);
  }
  return result;
}

/**
 * @param name название параметра
 * @param dict хранилище параметров по клиентам
 * @param ids ID клиентов, в которых нужно искать
 */
export function findClientParameter(name: ParameterName, dict: ParameterDict, ids: ClientID[]): Parameter {
  for (const clientID of ids) {
    const parameters = dict[clientID];
    if (!parameters) continue;
    const parameter = parameters.find(p => p.name === name);
    if (parameter) return parameter;
  }
  return undefined;
}

export function lockParameters(parameters: Parameter[]): void {
  for (const { editor, channelID } of parameters) {
    if (editor) {
      editor.disabled = true;
      if (channelID) editor.loading = true;
    }
  }
}
export function unlockParameters(parameters: Parameter[]): void {
  for (const { editor } of parameters) {
    if (editor) {
      editor.disabled = false;
      editor.loading = false;
    }
  }
}
