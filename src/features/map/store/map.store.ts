import { create } from 'zustand';


/** Хранилище состояний карт. */
export const useMapStore = create((): Record<FormID, MapState> => ({}));
/** Состояние мультикарты. */
export const useMapState = (id: FormID) => useMapStore(state => state[id]);

/** Хранилище состояний мультикарт. */
export const useMultiMapStore = create((): Record<FormID, MultiMapState> => ({}));
/** Состояние карты. */
export const useMultiMapState = (id: ClientID) => useMultiMapStore(state => state[id]);
