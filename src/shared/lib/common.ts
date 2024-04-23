/** Сравнивает два массива на равенство.
 *
 * **Не делает глубокое сравнение.**
 * @example
 * const obj = {};
 * compareArrays([1, 2], [1, 2]) => true
 * compareArrays([obj], [obj])   => true
 * compareArrays([obj], [{}])    => false
 * */
export function compareArrays(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/** Сравнивает два объекта на равенство.
 *
 * **Не делает глубокое сравнение.**
 * @example
 * compareObjects({x: 1}, {x: 1})   => true
 * compareObjects({x: []}, {x: []}) => false
 * */
export function compareObjects(a: Record<any, any>, b: Record<any, any>): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

/** Группирует массив объектов в несколько массивов по ключу.
 * @example
 * groupBy([{id: 3, name: 'bob'}, {id: 2, name: 'john'}, {id: 2, name: 'bob'}], el => el.name) =>
 * [[{id: 3, name: 'bob'}, {id: 2, name: 'bob'}], [{id: 2, name: 'john'}]]
 * */
export function groupBy<K, T>(list: Array<T>, keyGetter: (item: T) => K): Map<K, T[]> {
  const map: Map<K ,T[]> = new Map();
  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}

/* --- Dates --- */

/** Сериализует дату в строку в форате `YYYY-MM-DD` без учёта временных зон.
 * @example
 * stringifyLocalDate(new Date(2023, 6, 14)) => "2023-07-14"
 * */
export function stringifyLocalDate(date: Date): string {
  const month = date.getMonth() + 1;
  const monthString = month > 9 ? month : '0' + month;
  const day = date.getDate();
  const dayString = day > 9 ? day : '0' + day;
  return `${date.getFullYear()}-${monthString}-${dayString}`;
}

/* --- Trees --- */

/** Находит в дереве элемент. */
export function findInTree<T>(
  tree: T[], callback: (node: T) => boolean,
  childrenField: string = 'children',
): T | undefined {
  for (const node of tree) {
    if (callback(node)) return node;
    const children = node[childrenField];
    if (Array.isArray(children)) {
      const item = findInTree(children, callback, childrenField);
      if (item !== undefined) return item;
    }
  }
}

/**
 * Применяет функцию ко всем листьям дерева.
 *
 * Элемент считается листом, если его `childrenField` не является массивом.
 * */
export function forEachTreeLeaf<T>(
  tree: T[], callback: (leaf: T, i?: number) => void,
  childrenField: string = 'children',
): void {
  let i = 0;
  const visit = (treeItems: T[]) => {
    for (const item of treeItems) {
      const children = item[childrenField];
      if (Array.isArray(children)) {
        visit(children);
      } else {
        callback(item, i++);
      }
    }
  };
  visit(tree);
}

/* --- Sets --- */

/** Совмещает два итерируемых объекта и возвращает массив без повторений.
 * @example
 * uniqueArray(null, null) // []
 * uniqueArray([1, 2], [1, 3]) // [1, 2, 3]
 * */
export function uniqueArray<T>(a: Iterable<T> | null | undefined, b?: Iterable<T> | null): T[] {
  if (!a) return [...new Set(b)];
  if (!b) return [...new Set(a)];
  return [...new Set([...a, ...b])];
}

/** Возвращает объединение двух множеств.
 * @example
 * const a = new Set([1, 2]);
 * const b = new Set([2, 3]);
 * const c = setUnion(a, b); // Set {1, 2, 3}
 * */
export function setUnion<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...a, ...b]);
}

/** Возвращает пересечение двух множеств.
 * @example
 * const a = new Set([1, 2, 3]);
 * const b = new Set([2, 3, 4]);
 * const c = setIntersection(a, b); // Set {2, 3}
 * */
export function setIntersection<Type>(a: Set<Type>, b: Iterable<Type>): Set<Type> {
  const result = new Set<Type>();
  for (const element of b) {
    if (a.has(element)) result.add(element);
  }
  return result;
}

/** Возвращает множество элементов, которые входят в `a`, но НЕ входят в `b`. */
export function leftAntiJoin<Type>(a: Set<Type>, b: Iterable<Type>): Set<Type> {
  const result = new Set(a);
  for (const element of b) {
    if (result.has(element)) result.delete(element);
  }
  return result;
}

/** Декартово произведение.
 * @example
 * cartesianProduct([1, 2], [3, 4]) => [[1, 3], [1, 4], [2, 3], [2, 4]]
 * */
export function cartesianProduct(...values: any[][]): any[][] {
  return values.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));
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

/* --- Other --- */

/** `#ARGB => #RGBA`: на сервере иногда бывает неправильный формат. */
export function fixColorHEX(hex: ColorHEX): ColorHEX {
  if (hex?.length > 7) hex = '#' + hex.substring(3) + hex.substring(1, 3);
  return hex;
}

/** Разделяет строку по первому вхождению искомой подстроки.
 * @example
 * splitByFirstOccurrence('1, 2, 3', ', ') => ['1', '2, 3']
 * */
export function splitByFirstOccurrence(input: string, search: string): [string, string] {
  const index = input.indexOf(search);
  if (index === -1) return [input, ''];
  return [input.substring(0, index), input.substring(index + search.length)];
}
