import { create } from 'zustand';


export const useFetchStateStore = create<FetchStates>(() => ({
  session: null,
  forms: {},
}));

/** Состояние загрузки сессии. */
export const useSessionFetchState = () => useFetchStateStore(state => state.session);

/** Состояние загрузки формы/презентации. */
export const useFormFetchState = (id: ClientID) => useFetchStateStore(state => state.forms[id]);
