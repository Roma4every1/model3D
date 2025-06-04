import { create } from 'zustand';


/** Специальное хранилище для глобальных объектов. */
export const useGlobalStore = create((): GlobalState => ({
  config: null,
  variables: {},
}));

export function useAppConfig(): AppConfig {
  return useGlobalStore(state => state.config);
}
export function useGlobalVariable<T = any>(name: string): T {
  return useGlobalStore(state => state.variables[name]);
}

export function getGlobalVariable<T = any>(name: string): T {
  return useGlobalStore.getState().variables[name];
}
export function setGlobalVariable<T = any>(name: string, value: T): void {
  const variables = useGlobalStore.getState().variables;
  useGlobalStore.setState({variables: {...variables, [name]: value}});
}
