/**
 * Делает неглубокое сравнение массивов.
 * @example
 * compareArrays([1, 2], [1, 2]) => true
 * compareArrays([{}], [{}]) => false
 */
export function compareArrays<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Делает неглубокое сравнение объектов.
 * @example
 * compareObjects({x: 1}, {x: 1}) => true
 * compareObjects({x: []}, {x: []}) => false
 */
export function compareObjects(a: Record<any, any>, b: Record<any, any>): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

/**
 * Возвращает промис, который разрешится через указанное количество миллисекунд.
 * @example
 * await sleep(500); // подождать пол секунды
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

/** Возвращает первый элемент коллекции. */
export function firstItem<T>(c: T[] | Set<T> | Map<any, T>): T {
  return c.values().next().value;
}

/** Сохраняет файл с указанным именем и содержимым. */
export function saveFile(name: string, data: Blob): void {
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');

  a.setAttribute('href', url);
  a.setAttribute('download', name);
  a.click();
  URL.revokeObjectURL(url);
}

/* --- Trees --- */

/** Возвращает массив из всех узлов дерева. */
export function flatTree<T>(tree: T[], childrenField: string = 'children'): T[] {
  const result: T[] = [];
  const traverse = (nodes: T[]) => {
    for (const node of nodes) {
      result.push(node);
      const children = node[childrenField];
      if (Array.isArray(children)) traverse(children);
    }
  };
  traverse(tree);
  return result;
}

/* --- Binary Operations --- */

/** Преобразует строку в формате `base64` к бинарному виду. */
export function base64toBlob(data: string, contentType: string = '', sliceSize: number = 512): Blob {
  const byteCharacters = atob(data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, {type: contentType});
}

/* --- Strings --- */

/**
 * Разделяет строку по первому вхождению искомой подстроки.
 * @example
 * splitByFirstOccurrence('1, 2, 3', ', ') => ['1', '2, 3']
 */
export function splitByFirstOccurrence(input: string, search: string): [string, string] {
  const index = input.indexOf(search);
  if (index === -1) return [input, ''];
  return [input.substring(0, index), input.substring(index + search.length)];
}

/** Проверяет, удовлетворяет ли строка указанному критерию. */
export function testString(name: string, matcher: StringMatcher): boolean {
  if (typeof matcher === 'string') {
    return name === matcher;
  } else if (Array.isArray(matcher)) {
    return matcher.includes(name);
  } else {
    return matcher.test(name);
  }
}
