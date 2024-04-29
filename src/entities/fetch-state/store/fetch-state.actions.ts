import { useFetchStateStore } from './fetch-state.store';
import { FetchState, FetchStatus } from '../lib/utils';


export function resetFetchState(id: string): void {
  const fetchState = new FetchState(FetchStatus.NEED);
  useFetchStateStore.setState({[id]: fetchState});
}

export function fetchingStart(id: string): void {
  const fetchState = new FetchState(FetchStatus.PROCESSING);
  useFetchStateStore.setState({[id]: fetchState});
}

export function fetchingStartMany(ids: string[]): void {
  const state = useFetchStateStore.getState();
  for (const id of ids) state[id] = new FetchState(FetchStatus.PROCESSING);
  useFetchStateStore.setState({...state}, true);
}

export function fetchingEnd(id: string): void {
  const fetchState = new FetchState(FetchStatus.SUCCESS);
  useFetchStateStore.setState({[id]: fetchState});
}

export function fetchingEndMany(ids: string[]): void {
  const state = useFetchStateStore.getState();
  for (const id of ids) state[id] = new FetchState(FetchStatus.SUCCESS);
  useFetchStateStore.setState({...state}, true);
}

export function fetchingError(id: string, details?: string): void {
  const fetchState = new FetchState(FetchStatus.ERROR, details);
  useFetchStateStore.setState({[id]: fetchState});
}

export function fetchingErrorMany(entries: {id: string, details: string}[]): void {
  const state = useFetchStateStore.getState();
  for (const { id, details } of entries) {
    state[id] = new FetchState(FetchStatus.ERROR, details);
  }
  useFetchStateStore.setState({...state}, true);
}
