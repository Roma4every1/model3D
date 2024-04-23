import { create } from 'zustand';


/** Состояния презентаций. */
export const usePresentationStore = create<PresentationDict>(() => ({}));

export const usePresentation = (id: ClientID) => usePresentationStore(state => state[id]);
