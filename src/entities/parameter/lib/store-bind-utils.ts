/**
 * @overview Этот файл содержит вспомогательные функции для работы с параметрами.
 * Отличие от `utils.ts` в том, что экспортируемые функции не являются "чистыми"
 * и напрямую связаны с глобальной переменной стора.
 */

import { useParameterStore } from '../store/parameter.store';
import { ParameterStringTemplate } from './parameter-string-template';


/** Находит параметры клиентов сессии по их идентификаторам. */
export function findClientParameters(ids: Iterable<ParameterID>): Parameter[] {
  const result: Parameter[] = [];
  const storage = useParameterStore.getState().storage;

  for (const id of ids) {
    const parameter = storage.get(id);
    if (parameter) result.push(parameter);
  }
  return result;
}

/** Создаёт шаблон по исходному тексту с указанием областей видимости имён параметров. */
export function createParameterTemplate(s: string, scopes: Iterable<ClientID>): ParameterStringTemplate {
  const state = useParameterStore.getState();
  const parameterDict = state.clients;

  const resolveName = (name: ParameterName): ParameterID | undefined => {
    for (const id of scopes) {
      const parameter = parameterDict[id]?.find(p => p.name === name);
      if (parameter) return parameter.id;
    }
  };
  return new ParameterStringTemplate(s, resolveName);
}
