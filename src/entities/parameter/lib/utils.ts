import { getDataTypeName } from 'shared/lib';


/** Убирает лишние свойста и сериализует значение параметра перед отправкой запроса на сервер. */
export function serializeParameter(parameter: Parameter): SerializedParameter {
  return {id: parameter.name, type: parameter.type, value: parameter.toString()};
}

/** Находит и возвращает список каналов, необходимых для параметров. */
export function getParameterChannels(parameters: Parameter[]): Set<ChannelName> {
  const names: Set<ChannelName> = new Set();
  for (const parameter of parameters) {
    const name = parameter.channelName;
    if (name) names.add(name);
  }
  return names;
}

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

export function findParameterDependents(p: Parameter, depMap: Map<ParameterID, Set<ParameterID>>): void {
  const deps = depMap.get(p.id);
  if (deps.size === 0) { p.dependents = []; return; }

  const dependents: Set<ParameterID> = new Set();
  const queue: ParameterID[] = [...deps];
  const visited: Set<ParameterID> = new Set([p.id]);

  while (queue.length) {
    const id = queue.shift();
    if (visited.has(id)) continue;

    dependents.add(id);
    visited.add(id);

    for (const dep of depMap.get(id)) {
      if (!visited.has(dep)) queue.push(dep);
    }
  }
  p.dependents = [...dependents];
}
