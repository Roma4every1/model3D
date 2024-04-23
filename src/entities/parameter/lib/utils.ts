import { getDataTypeName } from 'shared/lib';
import { ParameterExpression } from './parameter.types';


export function parseDBPrimitive(value: string, typeName: string): any {
  const type = getDataTypeName(typeName);
  if (type === null) return null;

  if (/^[iu](?:8|16|32|64)$/.test(type)) {
    const n = Number(value);
    return Number.isNaN(n) ? null : Math.round(n);
  }
  if (/^f(?:32|64)$/.test(type)) {
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }
  if (type === 'string') { // string
    return value;
  }
  if (type === 'date') { // date
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (type === 'boolean') { // boolean
    return value === 'true' || value === '1';
  }
  return null;
}

/** Убирает лишние свойста и сериализует значение параметра перед отправкой запроса на сервер. */
export function serializeParameter(parameter: Parameter): SerializedParameter {
  return {id: parameter.id, type: parameter.type, value: parameter.toString()};
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
export function findDependentParameters(id: ParameterID, parameters: ParamDict): ParamDict {
  const dependencies: ParamDict = {};

  const find = (id: ParameterID, clientID: ClientID, clientParameters: Parameter[]) => {
    for (const parameter of clientParameters) {
      if (!parameter.dependsOn.includes(id)) continue;
      if (dependencies[clientID]?.includes(parameter)) continue;
      if (!dependencies[clientID]) dependencies[clientID] = [];
      dependencies[clientID].push(parameter);
      find(parameter.id, clientID, clientParameters);
    }
  };
  for (const clientID in parameters) {
    find(id, clientID, parameters[clientID]);
  }
  return dependencies;
}

/**
 * @example
 * '$(date.Year)' => [{id: 'date', method: 'Year'}]
 * '$(row.Cell[ID]:-1)' => [{id: 'row', method: 'Cell', argument: 'ID', defaultValue: '-1'}]
 */
export function parseParameterExpression(source: string): ParameterExpression[] | null {
  let defaultValue: string;
  const nodes: ParameterExpression[] = [];

  while (true) {
    if (!source) break;
    const match = source.match(/^\$\((\w+)(?:\.(\w+)(?:\[(\w+)])?)?(?::(.*))?\)$/);
    if (!match) { defaultValue = source; break; }

    const [, id, method, argument, defaultNodeValue] = match;
    source = defaultNodeValue;

    const node: ParameterExpression = {id, method: method ?? 'Value'};
    if (argument) node.argument = argument;
    nodes.push(node);
  }

  if (nodes.length === 0) return null;
  if (defaultValue) nodes[nodes.length - 1].defaultValue = defaultValue;
  return nodes;
}
