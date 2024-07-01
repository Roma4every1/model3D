/** Сравнивает два массива на равенство.
 *
 * **Не делает глубокое сравнение.**
 * @example
 * const obj = {};
 * compareArrays([1, 2], [1, 2]) => true
 * compareArrays([obj], [obj])   => true
 * compareArrays([obj], [{}])    => false
 */
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

/** Группирует массив объектов в несколько массивов по ключу.
 * @example
 * groupBy([{id: 3, name: 'bob'}, {id: 2, name: 'john'}, {id: 2, name: 'bob'}], el => el.name) =>
 * [[{id: 3, name: 'bob'}, {id: 2, name: 'bob'}], [{id: 2, name: 'john'}]]
 */
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

/**
 * Создаёт объект даты на основе строки.
 *
 * Распознаваемые форматы: `yyyy-mm-dd`, `dd.mm.yyyy`.
 *
 * @returns объект даты, если строка распознана, иначе `null`
 */
export function parseDate(input: string): Date | null {
  let date: Date;
  if (/^\d\d\d\d[.-]\d\d[.-]\d\d$/.test(input)) {
    date = new Date(input);
  } else if (/^\d\d[.-]\d\d[.-]\d\d\d\d$/.test(input)) {
    const year = input.substring(6);
    const month = input.substring(3, 5);
    const day = input.substring(0, 2);
    date = new Date(`${year}-${month}-${day}`);
  }
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

/**
 * Сериализует дату в строку в формате `YYYY-MM-DD` без учёта временных зон.
 * @example
 * stringifyLocalDate(new Date(2023, 6, 14)) => "2023-07-14"
 */
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
 */
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

/** `#ARGB => #RGBA`: на сервере иногда бывает неправильный формат. */
export function fixColorHEX(hex: ColorString): ColorString {
  if (hex?.length > 7) hex = '#' + hex.substring(3) + hex.substring(1, 3);
  return hex;
}
