import { stringToTableCell } from './utils';


type ParamStringGetter = (value: string) => string;
type PossibleDisplayValues = ({id: ParameterID, getter: ParamStringGetter} | string)[];
export type FormDisplayNamePattern = (PossibleDisplayValues | string)[];
export type ParamValuesDict = Record<ParameterID, any>;

export interface FormDisplayName {
  pattern: FormDisplayNamePattern,
  params: ParameterID[],
}


/** Возвращает значение динамического заголовка для конкретных значений параметров. */
export function getDisplayName(pattern: FormDisplayNamePattern, dict: ParamValuesDict): string {
  return pattern.map(patternItemToString, dict).join('');
}

function patternItemToString(this: ParamValuesDict, item: PossibleDisplayValues | string): string {
  if (typeof item === 'string') return item;

  for (const possibleValue of item) {
    if (typeof possibleValue === 'string') return possibleValue;
    const { id, getter } = possibleValue;

    const paramValue = this[id];
    if (!paramValue) continue;

    const value = getter(paramValue);
    if (value) return value;
  }
  return '';
}

/* --- --- --- */

/** Добавляет паттерн динамического заголовка в данные формы. */
export function applyDisplayNamePattern(formData: FormDataWMR): void {
  const str = formData.displayNameString;
  if (str) formData.displayNamePattern = createPatternFromString(str);
}

/** Создаёт паттерн динамического заголовка по свойству `displayNameString`. */
export function createPatternFromString(displayNameString: string): FormDisplayName {
  const pattern = [], params = [];
  const tokens = getTokens(displayNameString);
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];
    if (token === '$(') {
      const arr: PossibleDisplayValues = []; pattern.push(arr);
      i = fill(arr, params, tokens, i + 1);
    } else {
      pattern.push(token); i++;
    }
  }
  return {pattern, params};
}


/** Парсит строку динамического заголовка, возвращает список токенов.
 * @example
 * getTokens("График $(param.value[id]: )")
 * ["График ", "$(", "param.value[id]", ":", " ", ")"]
 * */
function getTokens(pattern: string) {
  const tokens: string[] = [];
  let i = 0, values = [];

  const pushStatic = () => {
    if (!values.length) return;
    tokens.push(values.join('')); values = [];
  };

  while (i < pattern.length) {
    const sign = pattern[i];
    const charCode = pattern.charCodeAt(i);
    const nextCharCode = pattern.charCodeAt(i + 1);

    if (charCode === 36 && nextCharCode === 40) { // check for '$('
      pushStatic(); tokens.push('$(');
      i += 2; continue;
    }
    if (charCode === 41 || charCode === 58) { // check for ')' or ':'
      pushStatic(); tokens.push(sign)
      i += 1; continue;
    }
    values.push(sign); i++;
  }
  pushStatic();
  return tokens;
}

function fill(arr: PossibleDisplayValues, params: ParameterID[], tokens: string[], start: number): number {
  const getter = createGetter(tokens[start]);
  arr.push(getter); params.push(getter.id);
  if (tokens[start + 1] !== ':') { arr.push(''); return start + 2; }

  const tokenAfter = tokens[start + 2];
  if (tokenAfter === '$(') return fill(arr, params, tokens,start + 3) + 1;
  arr.push(tokenAfter);
  return start + 4;
}

function createGetter(expr: string): {id: ParameterID, getter: ParamStringGetter} {
  // 'param.value[id]' => ['param', 'value', 'id']
  const [paramID, operation, arg] = expr.split(/[.[\]]/, 3);
  const argUpper = arg.toUpperCase();

  let getter: ParamStringGetter;
  if (operation === 'CellValue') {
    getter = (value: string) => stringToTableCell(value, argUpper);
  } else {
    getter = (value: string) => value;
  }

  return {id: paramID, getter};
}
