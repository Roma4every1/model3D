import { create } from 'zustand';
import { FetchState, FetchStatus } from '../lib/utils';


/** Хранилище состояний загрузки. */
export type FetchStates = Record<string, FetchState>;

/** Хранилище состояний загрузки. */
export const useFetchStateStore = create((): FetchStates => ({}));

/** Состояние загрузки. */
export function useFetchState(id: string): FetchState {
  const selector = (state: FetchStates) => {
    let fetchState = state[id];
    if (!fetchState) { fetchState = new FetchState(FetchStatus.NEED); state[id] = fetchState; }
    return fetchState;
  };
  return useFetchStateStore(selector);
}
