import { useSelector, useDispatch as useDispatch_ } from 'react-redux';


/** Функция, возвращающая текущее состояние приложения. */
export type StateGetter = () => WState;
/** @see https://en.wikipedia.org/wiki/Thunk */
export type Thunk<Result = void> = (dispatch: AppDispatch, getState?: StateGetter) => Promise<Result>;

type AppAction = {[p: string]: any} | Thunk;
export type AppDispatch = (action: AppAction) => AppAction;

const useDispatch = useDispatch_ as () => AppDispatch;
export { useSelector, useDispatch };

export * from './common';
export * from './math';
export * from './layout';
export * from './extension-icon-dict';
export { API, BaseAPI } from './api';
