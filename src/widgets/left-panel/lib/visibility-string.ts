import { ParameterMethod, parameterMethodDict } from 'entities/parameters';


/** Создаёт обработчики видимости для презентаций с заданной строкой видимости. */
export function handlePresentationTree(tree: PresentationTree, parameters: Parameter[]): void {
  let i = 0;
  const visit = (treeItems: PresentationTree) => {
    for (const item of treeItems) {
      if (item.items) {
        item.id = (i++).toString();
        visit(item.items);
      } else {
        handleItem(item, parameters)
      }
    }
  };
  visit(tree);
}

function handleItem(item: PresentationTreeItem, parameters: Parameter[]): void {
  const pattern = item.visibilityString;
  if (!pattern) { item.visible = true; return; }

  const neededParameters: ParameterID[] = [];
  const matchData: {pIndex: number, method: ParameterMethod}[] = [];

  for (const match of pattern.match(/(?<=\$\()[^)]+(?=\))/g)) {
    const [parameterID, operation] = match.split('.');
    const idx = parameters.findIndex(p => p.id === parameterID);
    if (idx !== -1) neededParameters.push(parameterID);
    const method = createMethod(parameters[idx]?.type, operation);
    matchData.push({pIndex: idx, method});
  }

  const handler = (globalParameters: Parameter[]): boolean => {
    const args = matchData.map(({ pIndex, method }) => {
      return method(globalParameters[pIndex]);
    });

    let i = 0;
    const replacer = (match: string) => args[i++] ?? match;
    const resultString = pattern.replaceAll(/\$\([^)]+\)/g, replacer);

    try {
      return Boolean(eval(resultString)); // eslint-disable-line no-eval
    } catch {
      return false;
    }
  };

  item.visibilityHandler = handler;
  item.visibilityParameters = new Set(neededParameters);
  item.visible = handler(parameters);
}

function createMethod(type: ParameterType, operation: string): ParameterMethod {
  let defaultValue = 'null';
  if (operation.includes(':')) [operation, defaultValue] = operation.split(':');

  if (!type) return () => defaultValue;
  let method: ParameterMethod;

  if (type === 'tableRow') {
    const match = operation.match(/(\w+)\[(\w+)]/);
    if (match) {
      operation = match[1];
      const meta = match[2].toUpperCase();
      const rawMethod: ParameterMethod = parameterMethodDict[type][operation];
      method = (p: Parameter): string => rawMethod(p, meta);
    }
  }

  if (method === undefined) method = parameterMethodDict[type][operation];
  return method
    ? (p: Parameter) => p.value !== null ? method(p) : defaultValue
    : () => defaultValue;
}
