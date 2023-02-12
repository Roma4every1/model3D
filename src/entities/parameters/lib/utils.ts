import { getParsedParamValue } from './parsing';


/** Обработка модели параметра после серверного запроса. */
export function handleParam(this: FormID, parameter: FormParameter): void {
  parameter.formID = this;
  parameter.value = getParsedParamValue(parameter.type, parameter.value);
  if (!parameter.nullDisplayValue) parameter.nullDisplayValue = 'Нет значения';
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
  const result: FormParameter[] = [];
  for (const id of ids) {
    for (const clientID of clientsID) {
      const clientParams = storage[clientID];
      const neededParam = clientParams.find(p => p.id === id);
      if (neededParam) { result.push(neededParam); break; }
    }
  }
  return result;
}
