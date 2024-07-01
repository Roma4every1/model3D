import { create } from 'zustand';


/** Хранилище состояний карт. */
export const useMapStore = create((): Record<FormID, MapState> => ({}));
/** Состояние мультикарты. */
export const useMapState = (id: FormID) => useMapStore(state => state[id]);
