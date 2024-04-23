import { useFetchStateStore } from './fetch-state.store';


/** Начало загрузки новой сессии. */
export function sessionFetchingStart(): void {
  const stateWait: FetchStateWait = {ok: undefined, loading: true, details: null};
  useFetchStateStore.setState({session: stateWait});
}

/** Конец загрузки новой сессии. */
export function sessionFetchingEnd(error?: any): void {
  const state: FetchState = error
    ? {ok: false, loading: false, details: error}
    : {ok: true, loading: false, details: null};
  useFetchStateStore.setState({session: state});
}

export function clientFetchingStart(ids: ClientID | ClientID[]): void {
  const forms = useFetchStateStore.getState().forms;
  if (Array.isArray(ids)) {
    for (const id of ids) forms[id] = {ok: undefined, loading: true, details: null};
  } else {
    forms[ids] = {ok: undefined, loading: true, details: null};
  }
  useFetchStateStore.setState({forms: {...forms}});
}

export function clientFetchingEnd(ids: ClientID | ClientID[]): void {
  const forms = useFetchStateStore.getState().forms;
  if (Array.isArray(ids)) {
    for (const id of ids) forms[id] = {ok: true, loading: false, details: null};
  } else {
    forms[ids] = {ok: true, loading: false, details: null};
  }
  useFetchStateStore.setState({forms: {...forms}});
}

export function clientFetchingError(entries: {id: ClientID, details: any}[]): void {
  const forms = useFetchStateStore.getState().forms;
  for (const { id, details } of entries) {
    forms[id] = {ok: false, loading: false, details};
  }
  useFetchStateStore.setState({forms: {...forms}});
}
