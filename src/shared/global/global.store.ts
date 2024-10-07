import { create } from 'zustand';


/** Специальное хранилище для глобальных объектов. */
export const useGlobalStore = create((): GlobalState => ({
  config: null,
  // styles: null,
}));

/** Конфигурация приложения. */
export function useAppConfig(): AppConfig {
  return useGlobalStore(state => state.config);
}

/** Конфигурация приложения (геттер). */
export function getAppConfig(): AppConfig {
  return useGlobalStore.getState().config;
}
