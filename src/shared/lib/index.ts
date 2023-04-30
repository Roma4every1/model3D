import { Dispatch } from 'redux';


/** Функция, возвращающая текущее состояние приложения. */
export type StateGetter = () => WState;
/** @see https://en.wikipedia.org/wiki/Thunk */
export type Thunk<Result = void> = (dispatch: Dispatch, getState?: StateGetter) => Promise<Result>;


export { measureText, getTextLinesCount } from './layout';
export { compareObjects, compareArrays, setUnion, leftAntiJoin } from './common';
export { round, getPragmaticMin, getPragmaticMax } from './common';
export { API, BaseAPI } from './api';

export const getParentFormId = (formID: FormID): FormID => {
  const index1 = formID.lastIndexOf(':');
  const index2 = formID.lastIndexOf(',');

  let index = index1;
  if (index === -1 || index2 > index1) index = index2;

  return (index === -1) ? '' : formID.substring(0, index);
}
