import type { MapState } from '../lib/types';
import { create } from 'zustand';


/** Хранилище состояний карт. */
export const useMapStore = create((): Record<FormID, MapState> => ({}));

export function useMapState(id: FormID): MapState {
  return useMapStore(state => state[id]);
}
