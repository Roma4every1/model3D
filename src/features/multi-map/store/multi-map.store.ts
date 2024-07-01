import { create } from 'zustand';


/** Хранилище состояний мультикарт. */
export const useMultiMapStore = create((): Record<FormID, MultiMapState> => ({}));

export function useMultiMapState(id: ClientID): MultiMapState {
  return useMultiMapStore(state => state[id]);
}
export function useMultiMapSync(id: ClientID): boolean | undefined {
  return useMultiMapStore(state => state[id]?.sync);
}
