import { getParsedParamValue } from './parsing';


/** Обработка модели параметра после серверного запроса. */
export function handleParam(parameter: Parameter): void {
  parameter.value = getParsedParamValue(parameter.type, parameter.value);
  if (!parameter.nullDisplayValue) parameter.nullDisplayValue = 'Нет значения';
  if (!parameter.dependsOn || (parameter.dependsOn.length === 1 && !parameter.dependsOn[0])) {
    parameter.dependsOn = [];
  }
}

/** Находит в хранилище параметров нужные элементы и наполняет массив.
 * @example
 * // поиск среди глобальных параметров
 * fillParamValues(ids, storage, [rootID]);
 *
 * // поиск среди глобальных и параметров презентации
 * fillParamValues(ids, storage, [rootID, presentationID]);
 * */
export function fillParamValues(ids: ParameterID[], storage: ParamDict, clientsID: Iterable<FormID>) {
  const result: Parameter[] = [];
  for (const id of ids) {
    for (const clientID of clientsID) {
      const neededParam = storage[clientID].find(p => p.id === id);
      if (neededParam) { result.push(neededParam); break; }
    }
  }
  return result;
}

/** Рекурсивно находит параметры, которые зависят от данного. */
export function findDependentParameters(id: ParameterID, list: Parameter[], updated: Parameter[]) {
  for (const parameter of list) {
    if (parameter.dependsOn.includes(id) && !updated.includes(parameter)) {
      updated.push(parameter);
      findDependentParameters(parameter.id, list, updated);
    }
  }
}

/* --- --- */

export function getComboBoxItems(channel: Channel) {
  const rows = channel.data?.rows;
  if (!rows) return null;

  const lookupColumns = channel.info.lookupColumns;
  const idIndex = lookupColumns.id.index;
  let valueIndex = lookupColumns.value.index;

  if (valueIndex === -1) valueIndex = idIndex;
  return rows.map((row) => getComboBoxItem(row, idIndex, valueIndex));
}

function getComboBoxItem(row: ChannelRow, idIndex: number, valueIndex: number) {
  const id = row.Cells[idIndex];
  return {id, name: row.Cells[valueIndex] ?? id, value: row};
}
