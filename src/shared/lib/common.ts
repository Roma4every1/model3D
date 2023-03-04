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

/* --- Sets --- */

/** Возвращает объединение двух множеств.
 * @example
 * const a = new Set([1, 2]);
 * const b = new Set([2, 3]);
 * const c = setUnion(a, b); // Set {1, 2, 3}
 * */
export function setUnion<Type>(a: Set<Type>, b: Set<Type>): Set<Type> {
  return new Set([...a, ...b]);
}

/** Возвращает множество элементов, которые входят в `a`, но НЕ входят в `b`. */
export function leftAntiJoin<Type>(a: Set<Type>, b: Iterable<Type>): Set<Type> {
  const result = new Set(a);
  for (const item of b) {
    if (result.has(item)) result.delete(item);
  }
  return result;
}
