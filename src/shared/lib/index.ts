import { Dispatch } from 'redux';


/** Функция, возвращающая текущее состояние приложения. */
export type StateGetter = () => WState;
/** @see https://en.wikipedia.org/wiki/Thunk */
export type Thunk<Result = void> = (dispatch: Dispatch, getState?: StateGetter) => Promise<Result>;


export * from './common';
export * from './math';
export * from './layout';
export { API, BaseAPI } from './api';
