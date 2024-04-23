import { create } from 'zustand';


/** Общее состояние приложения. */
export const useAppStore = create<AppState>(() => ({
  config: null,
  systemList: null,
  systemID: null,
  sessionID: null,
  sessionIntervalID: null,
}));
