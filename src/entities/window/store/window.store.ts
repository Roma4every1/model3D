import { create } from 'zustand';


/** Состояния окон и диалогов приложения. */
export const useWindowStore = create<WindowStates>(() => ({}));

/** Состояние диалога или окна. */
export const useWindowState = (id: WindowID) => useWindowStore(state => state[id]);
